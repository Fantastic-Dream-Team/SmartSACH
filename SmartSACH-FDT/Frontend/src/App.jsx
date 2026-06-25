// src/App.jsx
import { Suspense, lazy, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getToken } from './config/api.js';
import LoginPage from './features/auth/pages/LoginPage.jsx';
import HomePage from './features/home/pages/HomePage.jsx';
import RegisterPage from './features/auth/pages/RegisterPage.jsx';

const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage.jsx'));

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
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Suspense fallback={
                  <div className="flex justify-center items-center min-h-screen bg-gray-50">
                    <div className="w-12 h-12 rounded-full border-4 border-green-600 border-t-transparent animate-spin" />
                  </div>
                }>
                  <DashboardPage onLogout={handleLogout} />
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