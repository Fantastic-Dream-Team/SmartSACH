// Backend/src/middleware/auth.js
import { supabase } from '../config/supabase.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado. Token ausente.' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Sesión inválida o expirada.' });
    }

    req.user = user; 
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Error interno en la autenticación.' });
  }
};