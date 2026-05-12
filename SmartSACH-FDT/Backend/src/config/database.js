import pg from "pg";

import { env } from "./env.js";

const { Pool } = pg;

export const missingDatabaseConfig = [
  !env.databaseUrl && !env.dbHost ? "DB_HOST" : null,
  !env.databaseUrl && !env.dbName ? "DB_NAME" : null,
  !env.databaseUrl && !env.dbUser ? "DB_USER" : null,
  !env.databaseUrl && !env.dbPassword ? "DB_PASSWORD o DB_PASS" : null,
].filter(Boolean);

export const hasDatabaseConfig = missingDatabaseConfig.length === 0;

export const pool = hasDatabaseConfig
  ? new Pool(
      env.databaseUrl
        ? {
            connectionString: env.databaseUrl,
            ssl: env.dbSsl ? { rejectUnauthorized: false } : false,
          }
        : {
            host: env.dbHost,
            port: env.dbPort,
            database: env.dbName,
            user: env.dbUser,
            password: env.dbPassword,
            ssl: env.dbSsl ? { rejectUnauthorized: false } : false,
          },
    )
  : null;

export function getDatabaseDiagnostics() {
  return {
    hasDatabaseUrl: Boolean(env.databaseUrl),
    host: env.databaseUrl ? "DATABASE_URL" : env.dbHost,
    port: env.databaseUrl ? "DATABASE_URL" : env.dbPort,
    database: env.databaseUrl ? "DATABASE_URL" : env.dbName,
    user: env.databaseUrl ? "DATABASE_URL" : env.dbUser,
    hasPassword: Boolean(env.databaseUrl || env.dbPassword),
    ssl: Boolean(env.dbSsl),
    missing: missingDatabaseConfig,
  };
}

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
