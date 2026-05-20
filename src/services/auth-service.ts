import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { assertSupabaseConfigured, supabase } from "@/lib/supabase";

export async function signUp(email: string, password: string, name: string) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw error;
  return data;
}

export async function verifySignUpCode(email: string, token: string) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });
  if (error) throw error;
  return data;
}

export async function resendSignUpCode(email: string) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.auth.resend({
    email,
    type: "signup",
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  assertSupabaseConfigured();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  assertSupabaseConfigured();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
  assertSupabaseConfigured();
  return supabase.auth.onAuthStateChange(callback);
}
