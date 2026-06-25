import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// POST: Manejar el registro de ciudadanos
router.post('/register', async (req, res) => {
  const { correo, password, nombre, apellido, cedula } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({
      email: correo,
      password: password,
      options: {
        data: { nombre, apellido, cedula }
      }
    });

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({
      token: data.session?.access_token,
      user: {
        id: data.user?.id,
        correo: data.user?.email,
        nombre
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Manejar el inicio de sesión
router.post('/login', async (req, res) => {
  const { correo, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: password
    });

    if (error) return res.status(400).json({ error: error.message });

    res.status(200).json({
      token: data.session.access_token,
      user: {
        id: data.user.id,
        correo: data.user.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;