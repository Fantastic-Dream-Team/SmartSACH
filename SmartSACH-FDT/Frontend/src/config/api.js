// Frontend/src/config/api.js

// En producción usa el mismo origen (Express sirve API + dist/).
// En desarrollo puedes definir VITE_API_URL=http://localhost:10000 en .env
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export function getToken() {
    return localStorage.getItem("smartsach_token");
}

export function saveSession(payload) {
    localStorage.setItem("smartsach_token", payload.token);
    localStorage.setItem("smartsach_user", JSON.stringify(payload.user));
}

export function clearSession() {
    localStorage.removeItem("smartsach_token");
    localStorage.removeItem("smartsach_user");
}

export function showMessage(text, type = "danger") {
    const message = document.querySelector("#message");
    if (!message) return;

    message.className = `alert alert-${type}`;
    message.textContent = text;
}

export async function apiRequest(path, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    const token = getToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;
    const response = await fetch(url, {
        ...options,
        headers,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || "No se pudo completar la solicitud.");
    }

    return data;
}