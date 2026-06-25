// Backend/src/routes/dashboard.routes.js
import express from 'express';
import pool from '../config/database.js'; // Ajusta la extensión según tus archivos
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET: Obtener la información del ciudadano en David
router.get('/', requireAuth, async (req, res) => {
  try {
    const auth_id = req.user.id;

    // 1. Consultar perfil del usuario
    const userQuery = await pool.query(
      'SELECT usuario_id, nombre, apellido, estado_verificacion FROM public.usuarios WHERE auth_id = $1',
      [auth_id]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil de usuario no encontrado en SmartSACH.' });
    }

    const perfil = userQuery.rows[0];

    // 2. Consultar sus rutas
    const rutasQuery = await pool.query(
      `SELECT r.nombre_ruta, r.zona_sector, r.horario_estimado 
       FROM public.suscripciones s
       JOIN public.rutas r ON s.ruta_id = r.ruta_id
       WHERE s.usuario_id = $1`,
      [perfil.usuario_id]
    );

    // 3. Consultar estado de su pago
    const pagoQuery = await pool.query(
      'SELECT estado_pago, proximo_vencimiento FROM public.suscripciones WHERE usuario_id = $1 LIMIT 1',
      [perfil.usuario_id]
    );

    res.json({
      user: perfil,
      rutas: rutasQuery.rows,
      estado: pagoQuery.rows[0] || { estado_pago: 'pendiente', proximo_vencimiento: null }
    });

  } catch (err) {
    res.status(500).json({ error: 'Error al recuperar los datos del servidor.' });
  }
});

// Exportación correcta para ES Modules
export default router;