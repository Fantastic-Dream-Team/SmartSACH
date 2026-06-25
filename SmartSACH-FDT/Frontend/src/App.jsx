// Frontend/src/App.jsx
import { Suspense, lazy, useState } from 'react';
import { getToken } from './config/api.js';
import LoginPage from './features/auth/pages/LoginPage.jsx';

// Cargamos el Dashboard de forma "Perezosa" (Lazy). 
// Vite no lo cargará en el navegador hasta que 'token' sea verdadero.
const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage.jsx'));

export default function App() {
  const [token, setToken] = useState(getToken());

  const handleLoginSuccess = () => {
    setToken(getToken());
  };

  const handleLogout = () => {
    setToken(null);
  };

  return (
    <div className="app-container">
      {!token ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        // Suspense muestra una pantalla de carga amigable mientras el mapa se inicializa en segundo plano
        <Suspense fallback={
          <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Iniciando SmartSACH David...</span>
            </div>
          </div>
        }>
          <DashboardPage onLogout={handleLogout} />
        </Suspense>
      )}
    </div>
  );
}