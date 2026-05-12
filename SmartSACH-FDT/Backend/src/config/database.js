import pg from "pg";

import { env } from "./env.js";

const { Pool } = pg;

export const missingDatabaseConfig = [
  !env.dbHost ? "DB_HOST" : null,
  !env.dbName ? "DB_NAME" : null,
  !env.dbUser ? "DB_USER" : null,
  !env.dbPassword ? "DB_PASSWORD" : null,
].filter(Boolean);

export const hasDatabaseConfig = missingDatabaseConfig.length === 0;

export const pool = hasDatabaseConfig
  ? new Pool({
      host: env.dbHost,
      port: env.dbPort,
      database: env.dbName,
      user: env.dbUser,
      password: env.dbPassword,
      ssl: env.dbSsl ? { rejectUnauthorized: false } : false,
    })
  : null;

export function requireDatabase() {
  if (!pool) {
    const error = new Error(
      `Base de datos no configurada en el backend. Faltan variables: ${missingDatabaseConfig.join(", ")}.`,
    );
    error.statusCode = 503;
    throw error;
  }

  return pool;
}
