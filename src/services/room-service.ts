import type { Room } from "@/domain/models";
import { supabase } from "@/lib/supabase";
import { mapRoom, type RoomRow } from "./mappers";

export async function getRooms(homeId: string) {
  const { data, error } = await supabase.from("rooms").select("*").eq("home_id", homeId).order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapRoom(row as RoomRow));
}

export async function addRoom(homeId: string, room: { name: string; type?: Room["icon"] }) {
  const { data, error } = await supabase
    .from("rooms")
    .insert({ home_id: homeId, name: room.name, type: room.type ?? inferRoomType(room.name), status: "good" })
    .select("*")
    .single();
  if (error) throw error;
  return mapRoom(data as RoomRow);
}

export async function findOrCreateRoom(homeId: string, room: { name: string; type?: Room["icon"] }) {
  const name = room.name.trim();
  if (!name) throw new Error("Choose a room before continuing.");

  const rooms = await getRooms(homeId);
  const existing = rooms.find((item) => normalizeName(item.name) === normalizeName(name));
  if (existing) return { room: existing, created: false };

  const created = await addRoom(homeId, { name, type: room.type });
  return { room: created, created: true };
}

export async function updateRoomStatus(roomId: string, status: string) {
  const { data, error } = await supabase.from("rooms").update({ status }).eq("id", roomId).select("*").single();
  if (error) throw error;
  return mapRoom(data as RoomRow);
}

export async function deleteRoom(roomId: string) {
  const { error } = await supabase.from("rooms").delete().eq("id", roomId);
  if (error) throw error;
}

function inferRoomType(name: string): Room["icon"] {
  const lower = name.toLowerCase();
  if (lower.includes("kitchen")) return "kitchen";
  if (lower.includes("office") || lower.includes("study")) return "office";
  if (lower.includes("nursery") || lower.includes("baby")) return "nursery";
  if (lower.includes("bed")) return "bedroom";
  if (lower.includes("bath")) return "bathroom";
  if (lower.includes("dining")) return "dining-room";
  return "living-room";
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}
