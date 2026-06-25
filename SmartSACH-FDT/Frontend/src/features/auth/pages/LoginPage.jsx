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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
              <span className="text-3xl text-white font-bold">S</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">SmartSACH</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión inteligente de recolección en Chiriquí</p>
        </div>

        {/* Subtítulo */}
        <h2 className="text-xl font-semibold text-gray-700 text-center mb-6">
          Inicia sesión para entrar a tu panel
        </h2>

        {/* Mensaje de error */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
            <span className="text-lg">⚠️</span>
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
                errores.correo ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                errores.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
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
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 shadow-lg shadow-green-200"
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

        {/* Link a registro */}
        <p className="text-center text-sm text-gray-600 mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-green-600 hover:text-green-700 font-medium hover:underline transition-all">
            Crear cuenta
          </Link>
        </p>

        {/* Fecha */}
        <div className="text-center text-xs text-gray-400 mt-8">
          Sáb 2023 09:11:11
        </div>
      </div>
    </div>
  );
}