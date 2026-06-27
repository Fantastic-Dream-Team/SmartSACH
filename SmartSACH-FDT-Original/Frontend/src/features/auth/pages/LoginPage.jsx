// src/features/auth/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest, saveSession } from '../../../config/api.js';
import { LoginValidator } from '../../../utils/LoginValidator.js';

const BUILD_TAG = "build-2026-05-13-r1";
const validator = new LoginValidator();

export default function LoginPage({ onLoginSuccess }) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errores, setErrores] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    // Validación en cliente
    const esValido = validator.validar({ correo, password });
    setErrores(validator.getErrores());

    if (!esValido) {
      setLoading(false);
      return;
    }

    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ correo, password }),
      });

      saveSession(data);
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }
      
      onLoginSuccess();
      navigate('/perfil'); // ✅ Redirige a Perfil
    } catch (error) {
      setErrorMsg(error.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* ===== PANEL IZQUIERDO - BIENVENIDA ===== */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-green-800 to-green-600 text-white p-8 md:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
            <img src="/images/logos/logoblanco.png" alt="SmartSACH" className="h-12" />
            <h2 className="text-2xl font-bold">SmartSACH</h2>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">¡Bienvenido de vuelta!</h1>
          <p className="text-white/80 mb-6 leading-relaxed">
            Inicia sesión para acceder a tu panel de control, gestionar tus rutas y realizar pagos.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">🗺️</span>
              <span>Rastreo en tiempo real</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">📱</span>
              <span>Pagos fáciles y rápidos</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">📋</span>
              <span>Reporte de incidencias</span>
            </div>
          </div>
        </div>

        {/* ===== PANEL DERECHO - FORMULARIO ===== */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-green-800">Iniciar Sesión</h2>
            <p className="text-gray-500 text-sm mt-1">Ingresa tus credenciales para continuar</p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm mb-4">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Correo electrónico</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className={`w-full pl-10 pr-3 py-3 border ${errores.correo ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all`}
                  placeholder="tu@email.com"
                  disabled={loading}
                />
              </div>
              {errores.correo && <p className="text-red-500 text-xs mt-1">{errores.correo}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Contraseña</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border ${errores.password ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {errores.password && <p className="text-red-500 text-xs mt-1">{errores.password}</p>}
            </div>

            <div className="flex justify-between items-center mb-6">
              <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-green-600"
                />
                <span>Recordarme</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-green-700 hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Iniciando sesión..." : "Ingresar"}
            </button>

            <p className="text-center text-gray-500 text-sm mt-5">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="text-green-700 font-semibold hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </form>

          <p className="text-center text-gray-400 text-xs mt-4">{BUILD_TAG}</p>
        </div>
      </div>
    </div>
  );
}