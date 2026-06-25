// Frontend/src/config/api.js

// Apuntamos directamente a la URL de tu backend en Render usando la clave de tu imagen
const API_BASE_URL = "https://SmartSACH-FDT.onrender.com";

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

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || "No se pudo completar la solicitud.");
    }

    return data;
}