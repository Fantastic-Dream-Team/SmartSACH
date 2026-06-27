import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 10000;
export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY; // 👈 ¡Este es el cambio clave!
export const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-jwt';