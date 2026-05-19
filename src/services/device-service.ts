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
