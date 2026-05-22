// src/services/api.js
// Todas las llamadas al backend FastAPI pasan por aquí.
// Nunca escribas la URL directamente en los componentes.

const API_BASE = import.meta.env.VITE_API_URL;

// ─── Utilidad base ────────────────────────────────────────────────
async function request(path, options = {}) {
  const method = options.method || "GET";

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Si hay token guardado, lo manda automáticamente
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${path}`, config);
  const data = await response.json().catch(() => ({
    ok: false,
    message: "Respuesta inválida del servidor.",
  }));

  if (!response.ok || !data.ok) {
    const error = new Error(data.message || "Error en la solicitud.");
    error.status = response.status;
    error.errors = data.errors || {};
    throw error;
  }

  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────
export const login = (body) =>
  request("/api/auth/login", { method: "POST", body });

export const register = (body) =>
  request("/api/auth/register", { method: "POST", body });

export const me = () => request("/api/auth/me");

export const logout = () =>
  request("/api/auth/logout", { method: "POST", body: {} });

export const forgotPassword = (body) =>
  request("/api/auth/forgot-password", { method: "POST", body });

// ─── Dashboard ────────────────────────────────────────────────────
export const dashboardOverview = () => request("/api/dashboard/overview");

// ─── Perfil ───────────────────────────────────────────────────────
export const getProfile = () => request("/api/profile");

export const updateProfile = (body) =>
  request("/api/profile/update", { method: "POST", body });

// ─── Ubicaciones / Rutas ──────────────────────────────────────────
export const createLocation = (body) =>
  request("/api/locations/create", { method: "POST", body });

export const updateLocation = (id, body) =>
  request(`/api/locations/${id}/update`, { method: "POST", body });

// ─── Pagos ────────────────────────────────────────────────────────
export const paymentsSummary = () => request("/api/payments/summary");

export const paySubscription = (body) =>
  request("/api/payments/pay", { method: "POST", body });

// ─── Reportes ─────────────────────────────────────────────────────
export const createReport = (body) =>
  request("/api/reports/create", { method: "POST", body });

// ─── Paz y Salvo ──────────────────────────────────────────────────
export const pazYSalvo = () => request("/api/paz-y-salvo");