(function () {
  const API_BASE = window.SMARTSACH_API_BASE || `${window.location.origin}/backend/index.php`;

  const state = {
    csrfToken: "",
  };

  function sanitizeText(value) {
    return String(value ?? "").replace(/[<>&"']/g, (char) => ({
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&#039;",
    })[char]);
  }

  async function ensureCsrf(force = false) {
    if (state.csrfToken && !force) return state.csrfToken;
    const response = await fetch(`${API_BASE}/api/auth/csrf`, {
      credentials: "include",
      cache: "no-store",
    });
    const payload = await response.json();
    if (!payload.ok) throw new Error(payload.message || "No se pudo iniciar seguridad CSRF.");
    state.csrfToken = payload.csrfToken;
    return state.csrfToken;
  }

  async function request(path, options = {}, retry = true) {
    const method = options.method || "GET";
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (method !== "GET") {
      headers["X-CSRF-Token"] = await ensureCsrf();
    }

    let response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: "include",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });
    const payload = await response.json().catch(() => ({
      ok: false,
      message: "Respuesta inválida del servidor.",
    }));

    if (response.status === 419 && retry && method !== "GET") {
      headers["X-CSRF-Token"] = await ensureCsrf(true);
      response = await fetch(`${API_BASE}${path}`, {
        method,
        credentials: "include",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        cache: "no-store",
      });
      const retryPayload = await response.json().catch(() => ({
        ok: false,
        message: "Respuesta inválida del servidor.",
      }));
      if (!response.ok || !retryPayload.ok) {
        const error = new Error(retryPayload.message || "No se pudo completar la solicitud.");
        error.status = response.status;
        error.errors = retryPayload.errors || {};
        throw error;
      }
      return retryPayload;
    }

    if (!response.ok || !payload.ok) {
      const error = new Error(payload.message || "No se pudo completar la solicitud.");
      error.status = response.status;
      error.errors = payload.errors || {};
      throw error;
    }

    return payload;
  }

  window.SmartSachAPI = {
    sanitizeText,
    ensureCsrf,
    login: (body) => request("/api/auth/login", { method: "POST", body }),
    register: (body) => request("/api/auth/register", { method: "POST", body }),
    me: () => request("/api/auth/me"),
    logout: () => request("/api/auth/logout", { method: "POST", body: {} }),
    forgotPassword: (body) => request("/api/auth/forgot-password", { method: "POST", body }),
    pazYSalvo: () => request("/api/paz-y-salvo"),
  };
})();
