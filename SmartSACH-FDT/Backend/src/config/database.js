// Backend/src/config/database.js
import pg from 'pg';
import { env } from './env.js'; // Importación nativa usando ES Modules

const { Pool } = pg;

// Configuración del Pool de conexiones usando las variables del entorno unificado
const pool = new Pool({
  host: env.dbHost,
  port: env.dbPort,
  database: env.dbName,
  user: env.dbUser,
  password: env.dbPassword,
  // Habilitar SSL automáticamente si se conecta a Supabase o si está en producción
  ssl: env.dbSsl ? { rejectUnauthorized: false } : false,
  // Configuraciones óptimas para el Transaction Pooler de Supabase
  max: 10, // Máximo de conexiones simultáneas en el pool
  idleTimeoutMillis: 30000, // Tiempo para cerrar conexiones inactivas
  connectionTimeoutMillis: 2000, // Tiempo máximo para esperar una conexión libre
});

// Monitoreo de errores en el Pool para evitar que el servidor de Render se caiga por completo
pool.on('error', (err) => {
  console.error('Error inesperado en el Pool de PostgreSQL:', err);
});

export default pool;