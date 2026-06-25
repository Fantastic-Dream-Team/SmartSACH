// src/App.jsx
import { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getToken } from './config/api.js';
import Navbar from './components/Layout/Navbar.jsx';
import HomePage from './features/home/pages/HomePage.jsx';
import LoginPage from './features/auth/pages/LoginPage.jsx';
import RegisterPage from './features/auth/pages/RegisterPage.jsx';
import PlanesPage from './features/planes/pages/PlanesPage.jsx';
import PerfilTab from './features/dashboard/components/PerfilTab.jsx';
import MapaTab from './features/dashboard/components/MapaTab.jsx';
import PagosTab from './features/dashboard/components/PagosTab.jsx';
import SuscripcionTab from './features/dashboard/components/SuscripcionTab.jsx';

const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage.jsx'));

const ProtectedRoute = ({ children }) => {
  const token = getToken();
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  const [token, setToken] = useState(getToken());

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(getToken());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLoginSuccess = () => {
    setToken(getToken());
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 pt-16"> {/* pt-16 para el navbar fijo */}
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/planes" element={<PlanesPage />} />
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <div className="max-w-7xl mx-auto px-4 py-8">
                  <PerfilTab user={JSON.parse(localStorage.getItem('user') || '{}')} />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mapa"
            element={
              <ProtectedRoute>
                <div className="max-w-7xl mx-auto px-4 py-8">
                  <MapaTab />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pagos"
            element={
              <ProtectedRoute>
                <div className="max-w-7xl mx-auto px-4 py-8">
                  <PagosTab />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/suscripcion"
            element={
              <ProtectedRoute>
                <div className="max-w-7xl mx-auto px-4 py-8">
                  <SuscripcionTab />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Suspense fallback={
                  <div className="flex justify-center items-center min-h-screen bg-gray-50">
                    <div className="w-12 h-12 rounded-full border-4 border-green-600 border-t-transparent animate-spin" />
                  </div>
                }>
                  <DashboardPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}