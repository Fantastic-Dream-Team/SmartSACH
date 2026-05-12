import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { requireSupabase } from "../config/supabase.js";

const router = Router();

function createToken(user) {
  return jwt.sign(
    {
      usuario_id: user.usuario_id,
      nombre: user.nombre,
      correo_electronico: user.correo_electronico,
    },
    env.jwtSecret,
    { expiresIn: "8h" },
  );
}

router.post("/register", async (req, res, next) => {
  try {
    const db = requireSupabase();
    const { nombre, apellido, cedula, correo, password, descripcion } = req.body;

    if (!nombre || !apellido || !cedula || !correo || !password) {
      res.status(400).json({ error: "Completa nombre, apellido, cedula, correo y password." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { data: user, error: userError } = await db
      .from("usuarios")
      .insert({
        nombre,
        apellido,
        cedula,
        correo_electronico: correo,
        password: passwordHash,
      })
      .select("usuario_id, nombre, apellido, cedula, correo_electronico")
      .single();

    if (userError) {
      userError.statusCode = userError.code === "23505" ? 409 : 400;
      throw userError;
    }

    if (descripcion) {
      await db.from("ubicaciones_servicio").insert({
        usuario_id: user.usuario_id,
        descripcion_direccion: descripcion,
        coordenadas_gps: "SRID=4326;POINT(-82.43 8.43)",
      });
    }

    res.status(201).json({
      message: "Registro exitoso.",
      user,
      token: createToken(user),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const db = requireSupabase();
    const { correo, password } = req.body;

    if (!correo || !password) {
      res.status(400).json({ error: "Correo y password son requeridos." });
      return;
    }

    const { data: user, error } = await db
      .from("usuarios")
      .select("usuario_id, nombre, apellido, correo_electronico, password")
      .eq("correo_electronico", correo)
      .single();

    if (error || !user) {
      res.status(401).json({ error: "Credenciales incorrectas." });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: "Credenciales incorrectas." });
      return;
    }

    const { password: _password, ...safeUser } = user;

    res.json({
      message: "Inicio de sesion exitoso.",
      user: safeUser,
      token: createToken(safeUser),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
