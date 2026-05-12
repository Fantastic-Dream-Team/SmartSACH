import cors from "cors";
import express from "express";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import authRouter from "./routes/auth.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import healthRouter from "./routes/health.routes.js";
import statusRouter from "./routes/status.routes.js";

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendPath = join(__dirname, "..", "..", "Frontend");

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(
  cors({
    origin: env.corsOrigin === "*" ? true : env.corsOrigin,
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/api", (_req, res) => {
  res.json({
    name: "SmartSACH-FDT API",
    status: "online",
    health: "/health",
  });
});

app.use("/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/status", statusRouter);

if (existsSync(frontendPath)) {
  app.use(express.static(frontendPath));

  app.get("*", (_req, res, next) => {
    if (_req.path.startsWith("/api") || _req.path === "/health") {
      next();
      return;
    }

    res.sendFile(join(frontendPath, "index.html"));
  });
}

app.use((_req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
  });
});

app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    error: err.message || "Error interno del servidor",
  });
});

export default app;
