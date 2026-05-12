import { Router } from "express";

import { requireSupabase } from "../config/supabase.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const db = requireSupabase();
    const usuarioId = req.user.usuario_id;

    const { data: suscripciones, error } = await db
      .from("suscripciones")
      .select(`
        estado_pago,
        proximo_vencimiento,
        rutas (
          nombre_ruta,
          zona_sector,
          horario_estimado
        )
      `)
      .eq("usuario_id", usuarioId);

    if (error) {
      throw error;
    }

    const rutas = (suscripciones || [])
      .filter((item) => item.rutas)
      .map((item) => ({
        nombre_ruta: item.rutas.nombre_ruta,
        zona_sector: item.rutas.zona_sector,
        horario_estimado: item.rutas.horario_estimado,
      }));

    const estado = suscripciones?.[0]
      ? {
          estado_pago: suscripciones[0].estado_pago,
          proximo_vencimiento: suscripciones[0].proximo_vencimiento,
        }
      : null;

    res.json({
      user: req.user,
      rutas,
      estado,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
