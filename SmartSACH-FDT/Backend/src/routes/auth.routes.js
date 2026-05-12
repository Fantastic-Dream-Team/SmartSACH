import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";

import { requireDatabase } from "../config/database.js";
import { env } from "../config/env.js";

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
  const db = requireDatabase();
  const client = await db.connect();

  try {
    const { nombre, apellido, cedula, correo, password, descripcion } = req.body;

    if (!nombre || !apellido || !cedula || !correo || !password) {
      res.status(400).json({ error: "Completa nombre, apellido, cedula, correo y password." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await client.query("BEGIN");

    const userResult = await client.query(
      `INSERT INTO usuarios (nombre, apellido, cedula, correo_electronico, password)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING usuario_id, nombre, apellido, cedula, correo_electronico`,
      [nombre, apellido, cedula, correo, passwordHash],
    );

    const user = userResult.rows[0];

    if (descripcion) {
      await client.query(
        `INSERT INTO ubicaciones_servicio (usuario_id, descripcion_direccion, coordenadas_gps)
         VALUES ($1, $2, ST_GeogFromText($3))`,
        [user.usuario_id, descripcion, "SRID=4326;POINT(-82.43 8.43)"],
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Registro exitoso.",
      user,
      token: createToken(user),
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    if (error.code === "23505") {
      error.statusCode = 409;
      error.message = "Los datos ya estan registrados.";
    }
    next(error);
  } finally {
    client.release();
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const db = requireDatabase();
    const { correo, password } = req.body;

    if (!correo || !password) {
      res.status(400).json({ error: "Correo y password son requeridos." });
      return;
    }

    const result = await db.query(
      `SELECT usuario_id, nombre, apellido, correo_electronico, password
       FROM usuarios
       WHERE correo_electronico = $1
       LIMIT 1`,
      [correo],
    );

    const user = result.rows[0];
    if (!user) {
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
