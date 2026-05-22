import { apiClient } from "./apiClient";

export const authService = {
  login: async (body) => (await apiClient.post("/api/auth/login", body)).data,
  register: async (body) => (await apiClient.post("/api/auth/register", body)).data,
  me: async () => (await apiClient.get("/api/auth/me")).data,
  logout: async () => (await apiClient.post("/api/auth/logout", {})).data,
  forgotPassword: async (body) => (await apiClient.post("/api/auth/forgot-password", body)).data,
};
