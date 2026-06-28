import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import supabase from '../config/database.js';
import { JWT_SECRET } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router(); // 👈 Esto es lo que faltaba

// ===== REGISTRO =====
router.post('/register', async (req, res) => {
    try {
        const { nombre, apellido, cedula, correo, password } = req.body;

        if (!nombre || !apellido || !cedula || !correo || !password) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        const { data: authUser, error: authError } = await supabase.auth.signUp({
            email: correo,
            password: password,
            options: {
                data: { nombre, apellido, cedula }
            }
        });

        if (authError) {
            if (authError.message.includes('already registered')) {
                return res.status(400).json({ error: 'El correo ya está registrado' });
            }
            console.error('Error en Supabase Auth:', authError);
            return res.status(500).json({ error: 'Error al registrar usuario: ' + authError.message });
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('usuario_id, nombre, apellido, cedula, correo_electronico, estado_verificacion, fecha_registro')
            .eq('correo_electronico', correo)
            .single();

        if (userError) {
            console.error('Error al obtener usuario:', userError);
        }

        const token = jwt.sign(
            { 
                id: authUser.user?.id || userData?.usuario_id,
                correo: correo,
                nombre: nombre,
                apellido: apellido
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: userData?.usuario_id || authUser.user?.id,
                nombre: nombre,
                apellido: apellido,
                correo: correo,
                estado: userData?.estado_verificacion || 'pendiente'
            },
        });
    } catch (error) {
        console.error('Error en register:', error);
        res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
    }
});

// ===== LOGIN =====
router.post('/login', async (req, res) => {
    try {
        const { correo, password } = req.body;

        if (!correo || !password) {
            return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
        }

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: correo,
            password: password,
        });

        if (authError) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('usuario_id, nombre, apellido, cedula, correo_electronico, estado_verificacion')
            .eq('correo_electronico', correo)
            .single();

        if (userError) {
            console.error('Error al obtener usuario de tabla pública:', userError);
        }

        const token = authData.session?.access_token || jwt.sign(
            { 
                id: authData.user?.id,
                correo: correo,
                nombre: userData?.nombre || authData.user?.user_metadata?.nombre || 'Usuario',
                apellido: userData?.apellido || authData.user?.user_metadata?.apellido || ''
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token: token,
            user: {
                id: userData?.usuario_id || authData.user?.id,
                nombre: userData?.nombre || authData.user?.user_metadata?.nombre || 'Usuario',
                apellido: userData?.apellido || authData.user?.user_metadata?.apellido || '',
                correo: correo,
                estado: userData?.estado_verificacion || 'activo'
            },
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
    }
});

// ===== OBTENER PERFIL DEL USUARIO AUTENTICADO =====
router.get('/me', requireAuth, async (req, res) => {
  try {
    const userEmail = req.user.email;

    console.log('🔍 /me llamado para email:', userEmail);

    const { data: user, error } = await supabase
      .from('usuarios')
      .select('usuario_id, nombre, apellido, cedula, telefono, direccion, correo_electronico, estado_verificacion')
      .eq('correo_electronico', userEmail)
      .single();

    if (error) {
      console.error('❌ Error al obtener usuario por correo:', error);
      return res.status(404).json({ error: 'Usuario no encontrado en la tabla pública' });
    }

    console.log('✅ Usuario encontrado:', user);
    res.json(user);
  } catch (error) {
    console.error('❌ Error en /me:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;