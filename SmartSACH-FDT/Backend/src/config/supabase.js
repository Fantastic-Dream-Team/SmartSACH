// Backend/src/config/supabase.js
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env.js"; 

// Validar si la configuración existe
export const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
export const missingSupabaseConfig = [
  !SUPABASE_URL ? "SUPABASE_URL" : null,
  !SUPABASE_ANON_KEY ? "SUPABASE_ANON_KEY" : null,
].filter(Boolean);

// Inicializar el cliente
export const supabase = hasSupabaseConfig
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
      },
      realtime: {
        transport: ws,
      },
    })
  : null;

export function requireSupabase() {
  if (!supabase) {
    const error = new Error(
      `Supabase no está configurado en el backend. Faltan variables: ${missingSupabaseConfig.join(", ")}.`,
    );
    error.statusCode = 503;
    throw error;
  }
  return supabase;
}