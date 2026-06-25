import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws'; // 👈 Importar ws
import { SUPABASE_URL, SUPABASE_KEY } from './env.js';

console.log('🔍 SUPABASE_URL:', SUPABASE_URL ? '✅ Definida' : '❌ FALTA');
console.log('🔍 SUPABASE_KEY:', SUPABASE_KEY ? '✅ Definida' : '❌ FALTA');

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('❌ Faltan variables de entorno de Supabase');
}

// 👇 Configurar el cliente con soporte WebSocket
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    realtime: {
        transport: WebSocket, // 👈 ¡Esto es clave!
    },
});

export default supabase;