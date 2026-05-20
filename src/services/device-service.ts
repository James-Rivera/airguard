import type { DeviceType } from "@/domain/models";
import { supabase } from "@/lib/supabase";
import { mapDevice, type DeviceRow } from "./mappers";

export async function getDevices(homeId: string) {
  const { data, error } = await supabase.from("devices").select("*").eq("home_id", homeId).order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapDevice(row as DeviceRow));
}

export async function getDevicesByRoom(roomId: string) {
  const { data, error } = await supabase.from("devices").select("*").eq("room_id", roomId).order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapDevice(row as DeviceRow));
}

export async function addDevice(homeId: string, roomId: string, device: { name: string; type: DeviceType; batteryLevel?: number; powerConnected?: boolean }) {
  const { data, error } = await supabase
    .from("devices")
    .insert({
      home_id: homeId,
      room_id: roomId,
      name: device.name,
      type: device.type,
      connection_status: "online",
      safety_status: "good",
      battery_level: device.batteryLevel ?? null,
      power_connected: device.powerConnected ?? false,
      last_seen_at: new Date().toISOString(),
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapDevice(data as DeviceRow);
}

export async function findOrCreateDevice(homeId: string, roomId: string, device: { name: string; type: DeviceType; batteryLevel?: number; powerConnected?: boolean }) {
  const name = device.name.trim();
  if (!name) throw new Error("Enter a device name before continuing.");

  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .eq("home_id", homeId)
    .eq("room_id", roomId)
    .eq("type", device.type)
    .order("created_at", { ascending: true });
  if (error) throw error;

  const existing = ((data as DeviceRow[] | null) ?? []).find((row) => normalizeName(row.name) === normalizeName(name));
  if (existing) return { device: mapDevice(existing), created: false };

  const created = await addDevice(homeId, roomId, { ...device, name });
  return { device: created, created: true };
}

export async function removeExactDuplicateDevices(homeId: string) {
  const { data, error } = await supabase.from("devices").select("*").eq("home_id", homeId).order("created_at", { ascending: true });
  if (error) throw error;

  const seen = new Set<string>();
  const duplicateIds: string[] = [];
  for (const row of ((data as DeviceRow[] | null) ?? [])) {
    const key = [row.home_id, row.room_id ?? "", normalizeName(row.name), row.type].join(":");
    if (seen.has(key)) {
      duplicateIds.push(row.id);
    } else {
      seen.add(key);
    }
  }

  if (duplicateIds.length === 0) return 0;
  const { error: deleteError } = await supabase.from("devices").delete().in("id", duplicateIds);
  if (deleteError) throw deleteError;
  return duplicateIds.length;
}

export async function updateDeviceStatus(deviceId: string, status: string) {
  const { data, error } = await supabase
    .from("devices")
    .update({ connection_status: status, last_seen_at: new Date().toISOString() })
    .eq("id", deviceId)
    .select("*")
    .single();
  if (error) throw error;
  return mapDevice(data as DeviceRow);
}

export async function updateDeviceSafetyStatus(deviceId: string, safetyStatus: string) {
  const { data, error } = await supabase.from("devices").update({ safety_status: safetyStatus }).eq("id", deviceId).select("*").single();
  if (error) throw error;
  return mapDevice(data as DeviceRow);
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}
