import { Router } from "express";

import { hasSupabaseConfig, supabase } from "../config/supabase.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    if (!hasSupabaseConfig) {
      res.json({
        api: "ok",
        database: "sin_configurar",
        message: "Agrega SUPABASE_URL y SUPABASE_ANON_KEY para validar la base de datos.",
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
