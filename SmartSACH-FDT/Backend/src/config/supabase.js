import { createClient } from "@supabase/supabase-js";

import { env } from "./env.js";

export const hasSupabaseConfig = Boolean(env.supabaseUrl && env.supabaseAnonKey);

export const supabase = hasSupabaseConfig
  ? createClient(env.supabaseUrl, env.supabaseAnonKey)
  : null;

export function requireSupabase() {
  if (!supabase) {
    const error = new Error("Supabase no esta configurado en el backend.");
    error.statusCode = 503;
    throw error;
  }

  return supabase;
}
