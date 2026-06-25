// Frontend/src/App.jsx
import { useEffect, useState } from 'react';
import { getToken } from './config/api.js';
import LoginPage from './features/auth/pages/LoginPage.jsx';

// Hacemos una importación segura por si DashboardPage aún no está listo
let DashboardPage;
try {
  const module = await import('./features/dashboard/pages/DashboardPage.jsx');
  DashboardPage = module.default;
} catch (e) {
  console.warn("DashboardPage aún no ha sido implementado o tiene errores.");
}

export default function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Leer el token de forma segura tras montar el componente
  useEffect(() => {
    try {
      const t = getToken();
      setToken(t);
    } catch (error) {
      console.error("Error al leer el token:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando SmartSACH...</span>
        </div>
      </div>
    );
  }

  // Si no hay token o si DashboardPage no existe, forzar Login para evitar pantalla en blanco
  if (!token || !DashboardPage) {
    return <LoginPage onLoginSuccess={() => setToken(getToken())} />;
  }

  // Si todo está correcto, cargar panel
  const DashboardComponent = DashboardPage;
  return (
    <div className="app-container">
      <DashboardComponent onLogout={() => setToken(null)} />
    </div>
  );
}