import { Router } from "express";

import { hasSupabaseConfig, missingSupabaseConfig, supabase } from "../config/supabase.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    if (!hasSupabaseConfig) {
      res.json({
        api: "ok",
        database: "sin_configurar",
        missing: missingSupabaseConfig,
        message: "Agrega las variables faltantes en Render para validar la base de datos.",
      });
      return;
    }

    const { error } = await supabase.from("usuarios").select("usuario_id").limit(1);

    res.json({
      api: "ok",
      database: error ? "error" : "ok",
      details: error?.message || "Conexion con Supabase disponible.",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
