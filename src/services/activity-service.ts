import { supabase } from "@/lib/supabase";
import { mapActivity, type ActivityRow } from "./mappers";

export async function getRecentActivity(homeId: string) {
  const { data, error } = await supabase.from("activity_logs").select("*").eq("home_id", homeId).order("created_at", { ascending: false }).limit(30);
  if (error) throw error;
  return (data ?? []).map((row) => mapActivity(row as ActivityRow));
}

export async function createActivityLog(homeId: string, type: string, title: string, message?: string) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const { data, error } = await supabase
    .from("activity_logs")
    .insert({ home_id: homeId, user_id: userData.user?.id ?? null, type, title, message: message ?? null })
    .select("*")
    .single();
  if (error) throw error;
  return mapActivity(data as ActivityRow);
}
