import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

// 1. Validar si la configuración existe (Requerido por status.routes.js)
export const hasDatabaseConfig = Boolean(
  env.databaseUrl || (env.dbHost && env.dbPassword)
);

// 2. Listar qué variables faltan (Requerido por status.routes.js)
export const missingDatabaseConfig = [
  !env.databaseUrl && !env.dbHost ? "DB_HOST / DATABASE_URL" : null,
  !env.databaseUrl && !env.dbPassword ? "DB_PASSWORD" : null,
  !env.databaseUrl && !env.dbUser ? "DB_USER" : null,
].filter(Boolean);

// 3. Configuración del Pool de conexiones
const pool = new Pool({
  host: env.dbHost,
  port: env.dbPort,
  database: env.dbName,
  user: env.dbUser,
  password: env.dbPassword,
  ssl: env.dbSsl ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Error inesperado en el Pool de PostgreSQL:', err);
});

// 4. Función de diagnóstico de salud (Requerido por status.routes.js)
export const getDatabaseDiagnostics = async () => {
  const startTime = Date.now();
  try {
    const res = await pool.query('SELECT NOW() AS current_time, version();');
    return {
      status: 'healthy',
      latencyMs: Date.now() - startTime,
      timestamp: res.rows[0].current_time,
      version: res.rows[0].version
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latencyMs: Date.now() - startTime,
      error: error.message
    };
  }
};

// Exportaciones para ES Modules
export { pool };
export default pool;