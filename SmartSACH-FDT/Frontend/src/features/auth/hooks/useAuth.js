import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveSession, getToken, logout as logoutSession } from '../../../config/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Detectar token enviado por PHP en la URL (?token=...)
    const params = new URLSearchParams(location.search);
    const tokenFromPhp = params.get('token');

    if (tokenFromPhp) {
      // Guardar token en localStorage y limpiar URL
      saveSession({ token: tokenFromPhp });
      window.history.replaceState({}, document.title, location.pathname);
      // Recargar el estado del usuario
      setUser({ token: tokenFromPhp });
      setLoading(false);
      navigate('/dashboard');
      return;
    }

    // 2. Si ya hay token guardado, restaurar sesión
    const storedToken = getToken();
    if (storedToken) {
      // Aquí puedes hacer una petición al backend Node para obtener perfil si lo necesitas
      setUser({ token: storedToken });
    }
    setLoading(false);
  }, [location, navigate]);

  const logout = () => {
    logoutSession();
    setUser(null);
    // Redirigir al login de PHP para destruir sesión también
    const phpBaseUrl = import.meta.env.VITE_PHP_BASE_URL || 'http://localhost:8080';
    window.location.href = `${phpBaseUrl}/logout.php`;
  };

  return { user, loading, logout };
}