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

        // Verificar si el correo ya existe
        const { data: existingUser } = await supabase
            .from('usuarios')
            .select('correo_electronico')
            .eq('correo_electronico', correo)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar usuario en Supabase
        const { data: newUser, error } = await supabase
            .from('usuarios')
            .insert([
                {
                    nombre: nombre,
                    apellido: apellido,
                    cedula: cedula,
                    correo_electronico: correo,
                    password: hashedPassword,  // ✅ CORRECTO: usa 'password'
                    estado_verificacion: 'activo'
                },
            ])
            .select('usuario_id, nombre, apellido, cedula, correo_electronico, password, estado_verificacion, fecha_registro')
            .single();

        if (error) {
            console.error('Error al registrar usuario:', error);
            return res.status(500).json({ error: 'Error al registrar usuario: ' + error.message });
        }

        // Generar token JWT
        const token = jwt.sign(
            { 
                id: newUser.usuario_id, 
                correo: newUser.correo_electronico,
                nombre: newUser.nombre,
                apellido: newUser.apellido
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: newUser.usuario_id,
                nombre: newUser.nombre,
                apellido: newUser.apellido,
                correo: newUser.correo_electronico,
                estado: newUser.estado_verificacion
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

        // Validaciones
        if (!correo || !password) {
            return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
        }

        // Buscar usuario por correo electrónico
        const { data: user, error } = await supabase
            .from('usuarios')
            .select('usuario_id, nombre, apellido, cedula, correo_electronico, password, estado_verificacion')
            .eq('correo_electronico', correo)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // Generar token JWT
        const token = jwt.sign(
            { 
                id: user.usuario_id, 
                correo: user.correo_electronico,
                nombre: user.nombre,
                apellido: user.apellido
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.usuario_id,
                nombre: user.nombre,
                apellido: user.apellido,
                correo: user.correo_electronico,
                estado: user.estado_verificacion
            },
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
    }
});

export default router;