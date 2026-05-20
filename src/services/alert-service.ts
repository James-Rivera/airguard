import { supabase } from "@/lib/supabase";
import { mapAlert, type AlertRow, type DeviceRow, type RoomRow } from "./mappers";

type AlertInput = {
  homeId: string;
  roomId: string;
  deviceId?: string;
  title: string;
  message: string;
  severity: "warning" | "critical";
  recommendedAction: string;
};

export async function getAlerts(homeId: string) {
  const roomNames = await getRoomNameMap(homeId);
  const { data, error } = await supabase.from("alerts").select("*").eq("home_id", homeId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => {
    const alert = row as AlertRow;
    return mapAlert(alert, roomNames.get(alert.room_id));
  });
}

export async function getAlertsByRoom(roomId: string) {
  const { data: roomData, error: roomError } = await supabase.from("rooms").select("*").eq("id", roomId).single();
  if (roomError) throw roomError;
  const room = roomData as RoomRow;
  const { data, error } = await supabase.from("alerts").select("*").eq("room_id", roomId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapAlert(row as AlertRow, room.name));
}

export async function triggerKitchenSmokeAlert(homeId: string) {
  const { room, device } = await getKitchenTarget(homeId);
  if (!room) throw new Error("Create a kitchen or another room before triggering an alert.");

  return createAlert({
    homeId,
    roomId: room.id,
    deviceId: device?.id,
    title: `Smoke detected in ${room.name}`,
    message: "Smoke rose above the safety threshold near the cooking area.",
    severity: "critical",
    recommendedAction: "Check the kitchen now, turn on ventilation, and move people away from smoke.",
  }, room.name);
}

export async function createAlert(alert: AlertInput, roomName?: string) {
  const { data, error } = await supabase
    .from("alerts")
    .insert({
      home_id: alert.homeId,
      room_id: alert.roomId,
      device_id: alert.deviceId ?? null,
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      status: "active",
      recommended_action: alert.recommendedAction,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapAlert(data as AlertRow, roomName);
}

export async function startCheckingAlert(alertId: string) {
  const { data, error } = await supabase.from("alerts").update({ status: "checking" }).eq("id", alertId).select("*").single();
  if (error) throw error;
  return mapAlert(data as AlertRow);
}

export async function resolveAlert(alertId: string) {
  const { data, error } = await supabase.from("alerts").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", alertId).select("*").single();
  if (error) throw error;
  return mapAlert(data as AlertRow);
}

export async function resolveActiveAlerts(homeId: string, roomId?: string) {
  let query = supabase
    .from("alerts")
    .update({ status: "resolved", resolved_at: new Date().toISOString() })
    .eq("home_id", homeId)
    .neq("status", "resolved");

  if (roomId) query = query.eq("room_id", roomId);

  const { data, error } = await query.select("*");
  if (error) throw error;
  return (data ?? []).map((row) => mapAlert(row as AlertRow));
}

async function getKitchenTarget(homeId: string) {
  const { data: rooms, error: roomsError } = await supabase.from("rooms").select("*").eq("home_id", homeId).order("created_at", { ascending: true });
  if (roomsError) throw roomsError;
  const room = ((rooms as RoomRow[] | null) ?? []).find((item) => item.type === "kitchen" || item.name.toLowerCase().includes("kitchen")) ?? (rooms as RoomRow[] | null)?.[0];
  if (!room) return { room: null, device: null };

  const { data: devices, error: devicesError } = await supabase.from("devices").select("*").eq("room_id", room.id);
  if (devicesError) throw devicesError;
  const device = ((devices as DeviceRow[] | null) ?? []).find((item) => item.type === "smoke-detector") ?? (devices as DeviceRow[] | null)?.[0] ?? null;
  return { room, device };
}

async function getRoomNameMap(homeId: string) {
  const { data, error } = await supabase.from("rooms").select("*").eq("home_id", homeId);
  if (error) throw error;
  return new Map(((data as RoomRow[] | null) ?? []).map((room) => [room.id, room.name]));
}
