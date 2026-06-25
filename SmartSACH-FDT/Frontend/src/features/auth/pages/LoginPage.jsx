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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700">SmartSACH</h1>
          <p className="text-gray-500 text-sm mt-1">Inicia sesión para entrar a tu panel</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errores.correo ? 'border-red-400' : 'border-gray-300'
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errores.password ? 'border-red-400' : 'border-gray-300'
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
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-green-600 hover:text-green-700 font-medium hover:underline">
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}