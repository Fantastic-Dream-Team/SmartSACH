import { createContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";
import { ensureCsrf } from "../services/apiClient";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await ensureCsrf();
        const payload = await authService.me();
        if (mounted) setUser(payload.user || null);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsBootstrapping(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      async login(credentials) {
        const payload = await authService.login(credentials);
        setUser(payload.user || null);
        return payload;
      },
      async register(data) {
        const payload = await authService.register(data);
        setUser(payload.user || null);
        return payload;
      },
      async logout() {
        await authService.logout().catch(() => null);
        setUser(null);
      },
      async refreshUser() {
        const payload = await authService.me();
        setUser(payload.user || null);
        return payload.user || null;
      },
    }),
    [isBootstrapping, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
