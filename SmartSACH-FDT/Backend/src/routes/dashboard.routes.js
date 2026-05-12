import { Router } from "express";

import { requireDatabase } from "../config/database.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const db = requireDatabase();
    const usuarioId = req.user.usuario_id;

    const rutasResult = await db.query(
      `SELECT r.nombre_ruta, r.zona_sector, r.horario_estimado
       FROM rutas r
       INNER JOIN suscripciones s ON r.ruta_id = s.ruta_id
       WHERE s.usuario_id = $1`,
      [usuarioId],
    );

    const estadoResult = await db.query(
      `SELECT estado_pago, proximo_vencimiento
       FROM suscripciones
       WHERE usuario_id = $1
       LIMIT 1`,
      [usuarioId],
    );

    res.json({
      user: req.user,
      rutas: rutasResult.rows,
      estado: estadoResult.rows[0] || null,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
