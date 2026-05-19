import { supabase } from "@/lib/supabase";
import { mapHome, type HomeRow } from "./mappers";

export async function getHomesForCurrentUser() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const user = userData.user;
  if (!user) return [];

  const { data, error } = await supabase.from("home_members").select("homes(*)").eq("user_id", user.id);
  if (error) throw error;
  return (data ?? []).flatMap((item: any) => (item.homes ? [mapHome(item.homes as HomeRow)] : []));
}

export async function createHome(name: string, addressLabel?: string) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const user = userData.user;
  if (!user) throw new Error("No authenticated user.");

  const { data, error } = await supabase
    .from("homes")
    .insert({ name, address_label: addressLabel || null, created_by: user.id })
    .select("*")
    .single();
  if (error) throw error;
  return mapHome(data as HomeRow);
}

export async function getActiveHomeWithMembership() {
  const homes = await getHomesForCurrentUser();
  return homes[0] ?? null;
}
