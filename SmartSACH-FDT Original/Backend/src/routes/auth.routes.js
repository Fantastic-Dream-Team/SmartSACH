// Backend/src/routes/auth.routes.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import supabase from '../config/database.js';
import { JWT_SECRET } from '../config/env.js';

const router = express.Router();

// ===== REGISTRO =====
router.post('/register', async (req, res) => {
    try {
        const { nombre, apellido, cedula, correo, password } = req.body;

        // Validaciones
        if (!nombre || !apellido || !cedula || !correo || !password) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        // 1. Registrar usuario en Supabase Auth
        const { data: authUser, error: authError } = await supabase.auth.signUp({
            email: correo,
            password: password,
            options: {
                data: {
                    nombre: nombre,
                    apellido: apellido,
                    cedula: cedula,
                }
            }
        });

        if (authError) {
            if (authError.message.includes('already registered')) {
                return res.status(400).json({ error: 'El correo ya está registrado' });
            }
            console.error('Error en Supabase Auth:', authError);
            return res.status(500).json({ error: 'Error al registrar usuario: ' + authError.message });
        }

        // 2. El trigger `tr_on_auth_user_created` creará automáticamente el registro en la tabla `usuarios`
        // Esperamos un momento para que el trigger se ejecute
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. Obtener el usuario de la tabla pública
        const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('usuario_id, nombre, apellido, cedula, correo_electronico, estado_verificacion, fecha_registro')
            .eq('correo_electronico', correo)
            .single();

        if (userError) {
            console.error('Error al obtener usuario:', userError);
            // Aun así, el usuario ya fue creado en Auth
        }

        // Generar token JWT
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

        // 1. Autenticar con Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: correo,
            password: password,
        });

        if (authError) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // 2. Obtener datos del usuario desde la tabla pública
        const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('usuario_id, nombre, apellido, cedula, correo_electronico, estado_verificacion')
            .eq('correo_electronico', correo)
            .single();

        if (userError) {
            console.error('Error al obtener usuario de tabla pública:', userError);
            // Si no está en la tabla pública, usamos los datos de Auth
        }

        // Generar token JWT (usando el token de Supabase o uno propio)
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

export default router;