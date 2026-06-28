import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveSession, getToken, logout as logoutSession, apiRequest } from '../../../config/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserProfile = async (token) => {
      try {
        // Llamar al endpoint /api/auth/me con el token de Supabase
        const userData = await apiRequest('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        // Guardar usuario en localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        setUser({ token, ...userData });
      } catch (error) {
        console.error('Error al obtener perfil:', error);
        // Si falla, redirigir al login
        logoutSession();
        navigate('/login');
      }
    };

    // 1. Detectar token enviado por PHP en la URL (?token=...)
    const params = new URLSearchParams(location.search);
    const tokenFromPhp = params.get('token');

    if (tokenFromPhp) {
      // Guardar token en localStorage y limpiar URL
      saveSession({ token: tokenFromPhp });
      window.history.replaceState({}, document.title, location.pathname);

      // Obtener perfil del usuario
      fetchUserProfile(tokenFromPhp).finally(() => {
        setLoading(false);
        navigate('/dashboard');
      });
      return;
    }

    // 2. Si ya hay token guardado, restaurar sesión
    const storedToken = getToken();
    if (storedToken) {
      // Verificar si ya tenemos el usuario en localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setLoading(false);
      } else {
        // Si no, obtenerlo
        fetchUserProfile(storedToken).finally(() => {
          setLoading(false);
        });
      }
    } else {
      setLoading(false);
    }
  }, [location, navigate]);

  const logout = () => {
    logoutSession();
    setUser(null);
    const phpBaseUrl = import.meta.env.VITE_PHP_BASE_URL || 'http://localhost:8080';
    window.location.href = `${phpBaseUrl}/logout.php`;
  };

  return { user, loading, logout };
}