import { createClient } from "@supabase/supabase-js";

import { env } from "./env.js";

export const hasSupabaseConfig = Boolean(env.supabaseUrl && env.supabaseAnonKey);
export const missingSupabaseConfig = [
  !env.supabaseUrl ? "SUPABASE_URL" : null,
  !env.supabaseAnonKey ? "SUPABASE_ANON_KEY" : null,
].filter(Boolean);

export const supabase = hasSupabaseConfig
  ? createClient(env.supabaseUrl, env.supabaseAnonKey)
  : null;

export function requireSupabase() {
  if (!supabase) {
    const error = new Error(
      `Supabase no esta configurado en el backend. Faltan variables: ${missingSupabaseConfig.join(", ")}.`,
    );
    error.statusCode = 503;
    throw error;
  }

  return supabase;
}
