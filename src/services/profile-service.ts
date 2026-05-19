import { supabase } from "@/lib/supabase";
import { mapProfile, type ProfileRow } from "./mappers";

export async function getCurrentProfile() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const user = userData.user;
  if (!user) return null;

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (error) throw error;
  return mapProfile(data as ProfileRow);
}

export async function createProfileForUser(name?: string) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const user = userData.user;
  if (!user?.email) throw new Error("No authenticated user available for profile creation.");

  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, name: name?.trim() || user.user_metadata?.name || user.email.split("@")[0], email: user.email, role: "homeowner" }, { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw error;
  return mapProfile(data as ProfileRow);
}

export async function updateOnboardingComplete(complete: boolean) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error("No authenticated user.");

  const { data, error } = await supabase.from("profiles").update({ onboarding_complete: complete }).eq("id", userData.user.id).select("*").single();
  if (error) throw error;
  return mapProfile(data as ProfileRow);
}
