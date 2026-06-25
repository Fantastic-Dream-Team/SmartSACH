// src/features/auth/pages/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../../../config/api.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    correo: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    direccion: '',
    descripcion: '',
    latitud: 8.4286,
    longitud: -82.4319
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneralError('');
    setSuccessMsg('');

    // Validaciones básicas en cliente
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es obligatorio';
    if (!formData.cedula.trim()) newErrors.cedula = 'La cédula es obligatoria';
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es obligatorio';
    } else if (!formData.correo.includes('@')) {
      newErrors.correo = 'Ingresa un correo válido';
    }
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es obligatoria';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          cedula: formData.cedula,
          correo: formData.correo,
          telefono: formData.telefono,
          password: formData.password,
          direccion: formData.direccion,
          descripcion: formData.descripcion,
          latitud: formData.latitud,
          longitud: formData.longitud
        }),
      });

      setSuccessMsg('¡Cuenta creada exitosamente! Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setGeneralError(error.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* ===== PANEL IZQUIERDO - INFORMATIVO ===== */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-green-800 to-green-600 text-white p-8 md:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
            <img src="/images/logos/logoblanco.png" alt="SmartSACH" className="h-12" />
            <h2 className="text-2xl font-bold">SmartSACH</h2>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Únete a SmartSACH</h1>
          <p className="text-white/80 mb-6 leading-relaxed">
            Crea tu cuenta y comienza a gestionar tus rutas, pagos y reportes de manera inteligente.
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
        <div className="w-full md:w-7/12 p-6 md:p-10 overflow-y-auto max-h-[90vh]">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-green-800">Crear Cuenta</h2>
            <p className="text-gray-500 text-sm">Completa tus datos para registrarte</p>
          </div>

          {successMsg && (
            <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm mb-4 flex items-center gap-2">
              <span>✅</span>
              <span>{successMsg}</span>
            </div>
          )}

          {generalError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 flex items-center gap-2">
              <span>⚠️</span>
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-medium text-sm mb-1">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 border ${errors.nombre ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm`}
                  placeholder="Tu nombre"
                  disabled={loading}
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-medium text-sm mb-1">Apellido *</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 border ${errors.apellido ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm`}
                  placeholder="Tu apellido"
                  disabled={loading}
                />
                {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido}</p>}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium text-sm mb-1">Cédula *</label>
              <input
                type="text"
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 border ${errors.cedula ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm`}
                placeholder="Ej: 4-826-1202"
                disabled={loading}
              />
              {errors.cedula && <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium text-sm mb-1">Correo electrónico *</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 border ${errors.correo ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm`}
                placeholder="tu@email.com"
                disabled={loading}
              />
              {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium text-sm mb-1">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm"
                placeholder="+507 6123-4567"
                disabled={loading}
              />
              {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-medium text-sm mb-1">Contraseña *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 border ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm`}
                  placeholder="Mínimo 6 caracteres"
                  disabled={loading}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-medium text-sm mb-1">Confirmar contraseña *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 border ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm`}
                  placeholder="Confirma tu contraseña"
                  disabled={loading}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium text-sm mb-1">Dirección de recolección *</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 border ${errors.direccion ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm`}
                placeholder="Calle, sector, referencia"
                disabled={loading}
              />
              {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium text-sm mb-1">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm"
                placeholder="Puntos de referencia"
                disabled={loading}
              />
              {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>

            <p className="text-center text-gray-500 text-sm mt-2">
              ¿Ya tienes cuenta? <Link to="/login" className="text-green-700 font-semibold hover:underline">Inicia sesión aquí</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}