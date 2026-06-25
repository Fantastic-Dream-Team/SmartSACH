// Backend/src/config/supabase.js
import { createClient } from "@supabase/supabase-js";
import ws from "ws"; // Importación manual para dar soporte a Node.js < 22
import { env } from "./env.js";

// Validar si la configuración existe en las variables actuales (DB_PASS, etc.)
export const hasSupabaseConfig = Boolean(env.supabaseUrl && env.supabaseAnonKey);
export const missingSupabaseConfig = [
  !env.supabaseUrl ? "SUPABASE_URL" : null,
  !env.supabaseAnonKey ? "SUPABASE_ANON_KEY" : null,
].filter(Boolean);

// Inicializar el cliente inyectando manualmente el WebSocket transport
export const supabase = hasSupabaseConfig
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: false // Buenas prácticas para entornos de servidor Node.js
      },
      realtime: {
        transport: ws // Esto soluciona el error "without native WebSocket support"
      }
    })
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