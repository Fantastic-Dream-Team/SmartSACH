import { Router } from "express";

import {
  getDatabaseDiagnostics,
  hasDatabaseConfig,
  missingDatabaseConfig,
  pool,
} from "../config/database.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    if (!hasDatabaseConfig) {
      res.json({
        api: "ok",
        database: "sin_configurar",
        missing: missingDatabaseConfig,
        config: getDatabaseDiagnostics(),
        message: "Agrega las variables faltantes en Render para validar la base de datos.",
      });
      return;
    }

    await pool.query("SELECT 1");

    res.json({
      api: "ok",
      database: "ok",
      config: getDatabaseDiagnostics(),
      details: "Conexion PostgreSQL con Supabase disponible.",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
