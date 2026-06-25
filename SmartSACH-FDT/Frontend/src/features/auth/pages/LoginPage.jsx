// src/features/auth/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest, saveSession } from '../../../config/api.js';
import { LoginValidator } from '../../../utils/LoginValidator.js';

const validator = new LoginValidator();

export default function LoginPage({ onLoginSuccess }) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [errores, setErrores] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

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
      onLoginSuccess();
      navigate('/dashboard');
    } catch (error) {
      setErrorMsg(error.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-5">
        
        {/* ===== LADO IZQUIERDO (INFORMATIVO) ===== */}
        <div className="lg:col-span-2 bg-gradient-to-br from-green-50 to-green-100 p-10 flex flex-col justify-between relative">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-md shadow-green-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className="text-xl font-bold text-gray-800">SmartSACH</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 leading-tight mb-4">
              Gestión inteligente de recolección en Chiriquí
            </h1>
            <p className="text-gray-600 mb-8">
              Consulta rutas, pagos, reporta incidencias y mantén tu servicio al día.
            </p>

            {/* Lista de beneficios */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                Monitoreo en tiempo real de rutas
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                Reporte de incidencias rápido
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                Historial de pagos y suscripciones
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-8">
            © 2026 SmartSACH. Todos los derechos reservados.
          </div>
        </div>

        {/* ===== LADO DERECHO (FORMULARIO) ===== */}
        <div className="lg:col-span-3 bg-white p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Título */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">¡Hola de nuevo!</h2>
              <p className="text-gray-500 text-sm">Inicia sesión para entrar a tu panel</p>
            </div>

            {/* Mensaje de error */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {errorMsg}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errores.correo ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                  placeholder="tucorreo@ejemplo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  disabled={loading}
                />
                {errores.correo && (
                  <span className="text-xs text-red-600 mt-1 block">{errores.correo}</span>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                  <a href="#" className="text-xs text-green-600 hover:text-green-700 hover:underline">¿Olvidaste tu contraseña?</a>
                </div>
                <input
                  type="password"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errores.password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                {errores.password && (
                  <span className="text-xs text-red-600 mt-1 block">{errores.password}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-[1.01] disabled:opacity-60 shadow-lg shadow-green-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Ingresando...
                  </span>
                ) : (
                  'Ingresar'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-green-500 hover:text-green-600 font-medium hover:underline transition-all">
                Crear cuenta
              </Link>
            </p>

            <div className="text-center text-xs text-gray-400 mt-8">
              Sáb 2023 09:11:11
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}