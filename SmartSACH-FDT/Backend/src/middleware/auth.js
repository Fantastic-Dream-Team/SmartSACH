// Backend/src/middleware/auth.js
const supabase = require('../config/supabase');

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado. Token ausente.' });
    }

    const token = authHeader.split(' ')[1];

    // Validar el token directamente con el cliente de autenticación de Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Sesión inválida o expirada.' });
    }

    // Inyectamos el ID de autenticación en la petición para usarlo en las rutas
    req.user = user; 
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Error interno en el middleware de autenticación.' });
  }
};

module.exports = { requireAuth };