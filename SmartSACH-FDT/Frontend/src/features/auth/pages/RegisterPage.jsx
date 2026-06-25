// src/features/auth/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../../config/api.js';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    correo: '',
    password: '',
    confirmPassword: '',
  });
  const [errores, setErrores] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    }
    if (!formData.apellido.trim()) {
      nuevosErrores.apellido = 'El apellido es obligatorio';
    }
    if (!formData.cedula.trim()) {
      nuevosErrores.cedula = 'La cédula es obligatoria';
    }
    if (!formData.correo.trim()) {
      nuevosErrores.correo = 'El correo es obligatorio';
    } else if (!formData.correo.includes('@')) {
      nuevosErrores.correo = 'Ingresa un correo válido';
    }
    if (!formData.password) {
      nuevosErrores.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (formData.password !== formData.confirmPassword) {
      nuevosErrores.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!validarFormulario()) {
      setLoading(false);
      return;
    }

    try {
      await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          cedula: formData.cedula,
          correo: formData.correo,
          password: formData.password,
        }),
      });

      setSuccessMsg('¡Cuenta creada exitosamente! Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setErrorMsg(error.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700">SmartSACH</h1>
          <p className="text-gray-500 text-sm mt-1">Crea tu cuenta</p>
        </div>

        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            ✅ {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            ❌ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              name="nombre"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errores.nombre ? 'border-red-400' : 'border-gray-300'
              }`}
              placeholder="Tu nombre"
              value={formData.nombre}
              onChange={handleChange}
              disabled={loading}
            />
            {errores.nombre && (
              <span className="text-xs text-red-600 mt-1 block">{errores.nombre}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
            <input
              type="text"
              name="apellido"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errores.apellido ? 'border-red-400' : 'border-gray-300'
              }`}
              placeholder="Tu apellido"
              value={formData.apellido}
              onChange={handleChange}
              disabled={loading}
            />
            {errores.apellido && (
              <span className="text-xs text-red-600 mt-1 block">{errores.apellido}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cédula *</label>
            <input
              type="text"
              name="cedula"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errores.cedula ? 'border-red-400' : 'border-gray-300'
              }`}
              placeholder="8-888-8888"
              value={formData.cedula}
              onChange={handleChange}
              disabled={loading}
            />
            {errores.cedula && (
              <span className="text-xs text-red-600 mt-1 block">{errores.cedula}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
            <input
              type="email"
              name="correo"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errores.correo ? 'border-red-400' : 'border-gray-300'
              }`}
              placeholder="tucorreo@ejemplo.com"
              value={formData.correo}
              onChange={handleChange}
              disabled={loading}
            />
            {errores.correo && (
              <span className="text-xs text-red-600 mt-1 block">{errores.correo}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña * (mínimo 6 caracteres)</label>
            <input
              type="password"
              name="password"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errores.password ? 'border-red-400' : 'border-gray-300'
              }`}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            {errores.password && (
              <span className="text-xs text-red-600 mt-1 block">{errores.password}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña *</label>
            <input
              type="password"
              name="confirmPassword"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errores.confirmPassword ? 'border-red-400' : 'border-gray-300'
              }`}
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
            {errores.confirmPassword && (
              <span className="text-xs text-red-600 mt-1 block">{errores.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-green-600 hover:text-green-700 font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}