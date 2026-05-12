import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export function requireAuth(req, _res, next) {
  const authHeader = req.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    const error = new Error("Token de autenticacion requerido.");
    error.statusCode = 401;
    next(error);
    return;
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    next();
  } catch (_error) {
    const error = new Error("Token invalido o expirado.");
    error.statusCode = 401;
    next(error);
  }
}
