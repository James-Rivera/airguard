import type { Reading } from "@/domain/models";
import { supabase } from "@/lib/supabase";
import { mapReading, type DeviceRow, type ReadingRow, type RoomRow } from "./mappers";

export async function getLatestReadings(homeId: string) {
  const { data, error } = await supabase.from("readings").select("*").eq("home_id", homeId).order("created_at", { ascending: false }).limit(60);
  if (error) throw error;
  return dedupeLatest((data ?? []).map((row) => mapReading(row as ReadingRow)));
}

export async function getRecentReadingHistory(homeId: string) {
  const { data, error } = await supabase.from("readings").select("*").eq("home_id", homeId).order("created_at", { ascending: false }).limit(160);
  if (error) throw error;
  return (data ?? []).map((row) => mapReading(row as ReadingRow));
}

export async function getReadingsByRoom(roomId: string) {
  const { data, error } = await supabase.from("readings").select("*").eq("room_id", roomId).order("created_at", { ascending: false }).limit(20);
  if (error) throw error;
  return dedupeLatest((data ?? []).map((row) => mapReading(row as ReadingRow)));
}

export async function insertReading(reading: {
  homeId: string;
  roomId: string;
  deviceId?: string;
  type: Reading["type"];
  value: number;
  unit: string;
  status: string;
  statusLabel?: string;
}) {
  await assertReadingRoom(reading.homeId, reading.roomId);
  const deviceId = await resolveReadingDeviceId(reading.homeId, reading.roomId, reading.deviceId);
  const { data, error } = await supabase
    .from("readings")
    .insert({
      home_id: reading.homeId,
      room_id: reading.roomId,
      device_id: deviceId,
      type: reading.type,
      value: reading.value,
      unit: reading.unit,
      status: reading.status,
      status_label: reading.statusLabel ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapReading(data as ReadingRow);
}

async function assertReadingRoom(homeId: string, roomId: string) {
  const { data, error } = await supabase
    .from("rooms")
    .select("id, home_id")
    .eq("id", roomId)
    .eq("home_id", homeId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Selected room is not available for this home.");
}

async function resolveReadingDeviceId(homeId: string, roomId: string, deviceId?: string) {
  if (!deviceId) return null;

  const { data, error } = await supabase
    .from("devices")
    .select("id, home_id, room_id")
    .eq("id", deviceId)
    .eq("home_id", homeId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Selected device is not available for this home.");

  const device = data as Pick<DeviceRow, "id" | "home_id" | "room_id">;
  if (device.room_id !== roomId) throw new Error("Selected device is not assigned to this room.");

  return device.id;
}

export async function simulateNormalReadings(homeId: string) {
  const rows = await buildSimulationRows(homeId, "normal");
  return insertReadings(rows);
}

export async function simulateWarningReadings(homeId: string) {
  const rows = await buildSimulationRows(homeId, "warning");
  return insertReadings(rows);
}

export async function simulateCriticalReadings(homeId: string) {
  const rows = await buildSimulationRows(homeId, "critical");
  return insertReadings(rows);
}

async function insertReadings(rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) return [];
  const { data, error } = await supabase.from("readings").insert(rows).select("*");
  if (error) throw error;
  return (data ?? []).map((row) => mapReading(row as ReadingRow));
}

async function buildSimulationRows(homeId: string, scenario: "normal" | "warning" | "critical") {
  const { data: rooms, error: roomsError } = await supabase.from("rooms").select("*").eq("home_id", homeId).order("created_at", { ascending: true });
  if (roomsError) throw roomsError;
  const { data: devices, error: devicesError } = await supabase.from("devices").select("*").eq("home_id", homeId);
  if (devicesError) throw devicesError;

  const kitchen = (rooms as RoomRow[] | null)?.find((room) => room.type === "kitchen" || room.name.toLowerCase().includes("kitchen"));
  const baseRooms = (rooms as RoomRow[] | null) ?? [];
  const baseDevices = (devices as DeviceRow[] | null) ?? [];

  if (scenario === "normal") {
    return baseRooms.flatMap((room) => {
      const device = baseDevices.find((item) => item.room_id === room.id);
      return [
        readingRow(homeId, room.id, device?.id, "co2", 430, "ppm", "good", "Good"),
        readingRow(homeId, room.id, device?.id, "humidity", 49, "%", "good", "Normal"),
      ];
    });
  }

  const target = kitchen ?? baseRooms[0];
  if (!target) return [];
  const device = baseDevices.find((item) => item.room_id === target.id && item.type === "smoke-detector") ?? baseDevices.find((item) => item.room_id === target.id);
  if (scenario === "critical") {
    return [
      readingRow(homeId, target.id, device?.id, "smoke", 286, "ug/m3", "critical", "Critical"),
      readingRow(homeId, target.id, device?.id, "co2", 1180, "ppm", "warning", "High"),
    ];
  }
  return [
    readingRow(homeId, target.id, device?.id, "co2", 980, "ppm", "warning", "Rising"),
    readingRow(homeId, target.id, device?.id, "humidity", 64, "%", "warning", "High"),
  ];
}

function readingRow(homeId: string, roomId: string, deviceId: string | undefined, type: Reading["type"], value: number, unit: string, status: string, statusLabel: string) {
  return {
    home_id: homeId,
    room_id: roomId,
    device_id: deviceId ?? null,
    type,
    value,
    unit,
    status,
    status_label: statusLabel,
  };
}

function dedupeLatest(readings: Reading[]) {
  const seen = new Set<string>();
  return readings.filter((reading) => {
    const key = `${reading.roomId}:${reading.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
