import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || `${window.location.origin}/backend/index.php`;

let csrfToken = "";

export function sanitizeText(value) {
  return String(value ?? "").replace(/[<>&"']/g, (char) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "\"": "&quot;",
    "'": "&#039;",
  })[char]);
}

export async function ensureCsrf(force = false) {
  if (csrfToken && !force) return csrfToken;
  const response = await axios.get(`${API_BASE}/api/auth/csrf`, {
    withCredentials: true,
    headers: { "Cache-Control": "no-store" },
  });
  if (!response.data?.ok) {
    throw new Error(response.data?.message || "No se pudo iniciar seguridad CSRF.");
  }
  csrfToken = response.data.csrfToken;
  return csrfToken;
}

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const method = (config.method || "get").toLowerCase();
  if (method !== "get") {
    config.headers["X-CSRF-Token"] = await ensureCsrf();
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (!response.data?.ok) {
      const err = new Error(response.data?.message || "No se pudo completar la solicitud.");
      err.status = response.status;
      err.errors = response.data?.errors || {};
      throw err;
    }
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const original = error.config || {};
    const method = (original.method || "get").toLowerCase();

    if (status === 419 && !original._retry && method !== "get") {
      original._retry = true;
      original.headers = original.headers || {};
      original.headers["X-CSRF-Token"] = await ensureCsrf(true);
      return apiClient(original);
    }

    const payload = error.response?.data;
    const normalized = new Error(payload?.message || error.message || "No se pudo completar la solicitud.");
    normalized.status = status || 500;
    normalized.errors = payload?.errors || {};
    throw normalized;
  }
);
