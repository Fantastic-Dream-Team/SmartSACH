import { useState } from 'react';
import { getToken } from './config/api.js';
import LoginPage from './features/auth/pages/LoginPage.jsx';
import DashboardPage from './features/dashboard/pages/DashboardPage.jsx';

export default function App() {
  // Inicializamos el estado leyendo el token actual
  const [token, setToken] = useState(getToken());

  // Función para cuando el usuario inicia sesión con éxito
  const handleLoginSuccess = () => {
    setToken(getToken());
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    setToken(null);
  };

  // Enrutamiento condicional limpio
  return (
    <div className="app-container">
      {!token ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <DashboardPage onLogout={handleLogout} />
      )}
    </div>
  );
}