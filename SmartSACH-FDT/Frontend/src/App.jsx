// Frontend/src/App.jsx
import { Suspense, lazy, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getToken } from './config/api.js';
import LoginPage from './features/auth/pages/LoginPage.jsx';
import HomePage from './features/home/pages/HomePage.jsx'; // ← ✅ Ruta correcta
import RegisterPage from './features/auth/pages/RegisterPage.jsx';

// Cargamos el Dashboard de forma "Perezosa" (Lazy)
const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage.jsx'));

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const token = getToken();
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  const [token, setToken] = useState(getToken());

  const handleLoginSuccess = () => {
    setToken(getToken());
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Routes>
          {/* Ruta pública - HOME */}
          <Route path="/" element={<HomePage />} />
          
          {/* Ruta de Login */}
          <Route 
            path="/login" 
            element={<LoginPage onLoginSuccess={handleLoginSuccess} />} 
          />
          
          {/* Ruta de Register */}
          <Route 
            path="/register" 
            element={<RegisterPage />} 
          />
          
          {/* Ruta protegida - Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Suspense fallback={
                  <div className="flex justify-center items-center min-h-screen bg-gray-50">
                    <div
                      className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"
                      role="status"
                    >
                      <span className="sr-only">Iniciando SmartSACH...</span>
                    </div>
                  </div>
                }>
                  <DashboardPage onLogout={handleLogout} />
                </Suspense>
              </ProtectedRoute>
            }
          />
          
          {/* Redirección 404 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}