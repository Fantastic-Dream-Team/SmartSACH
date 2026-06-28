import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { SUPABASE_URL, SUPABASE_ANON_KEY as SUPABASE_KEY } from './env.js';

console.log('🔍 SUPABASE_URL:', SUPABASE_URL ? '✅ Definida' : '❌ FALTA');
console.log('🔍 SUPABASE_KEY:', SUPABASE_KEY ? '✅ Definida' : '❌ FALTA');

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('❌ Faltan variables de entorno de Supabase');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    realtime: {
        transport: WebSocket,
    },
});

export default supabase;