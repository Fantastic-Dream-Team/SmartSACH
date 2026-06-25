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

    if (!formData.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio';
    if (!formData.apellido.trim()) nuevosErrores.apellido = 'El apellido es obligatorio';
    if (!formData.cedula.trim()) nuevosErrores.cedula = 'La cédula es obligatoria';
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-5">
        
        {/* ===== LADO IZQUIERDO (INFORMATIVO) ===== */}
        <div className="lg:col-span-2 bg-gradient-to-br from-green-50 to-green-100 p-10 flex flex-col justify-between relative">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-md shadow-green-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className="text-xl font-bold text-gray-800">SmartSACH</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 leading-tight mb-4">
              Únete a SmartSACH
            </h1>
            <p className="text-gray-600 mb-8">
              Crea tu cuenta y comienza a gestionar tus rutas, pagos y reportes.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                Acceso a rutas en tiempo real
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                Gestión de pagos y suscripciones
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                Soporte 24/7
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
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Crear cuenta</h2>
              <p className="text-gray-500 text-sm">Completa tus datos para registrarte</p>
            </div>

            {successMsg && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      errores.nombre ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                    }`}
                    placeholder="Juan"
                    value={formData.nombre}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errores.nombre && <span className="text-xs text-red-600 mt-1 block">{errores.nombre}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                  <input
                    type="text"
                    name="apellido"
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      errores.apellido ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                    }`}
                    placeholder="Pérez"
                    value={formData.apellido}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errores.apellido && <span className="text-xs text-red-600 mt-1 block">{errores.apellido}</span>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cédula *</label>
                <input
                  type="text"
                  name="cedula"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errores.cedula ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                  placeholder="8-888-8888"
                  value={formData.cedula}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errores.cedula && <span className="text-xs text-red-600 mt-1 block">{errores.cedula}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  name="correo"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errores.correo ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                  placeholder="tucorreo@ejemplo.com"
                  value={formData.correo}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errores.correo && <span className="text-xs text-red-600 mt-1 block">{errores.correo}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña * (mínimo 6 caracteres)</label>
                <input
                  type="password"
                  name="password"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errores.password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errores.password && <span className="text-xs text-red-600 mt-1 block">{errores.password}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errores.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errores.confirmPassword && <span className="text-xs text-red-600 mt-1 block">{errores.confirmPassword}</span>}
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
                    Registrando...
                  </span>
                ) : (
                  'Registrarse'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-green-500 hover:text-green-600 font-medium hover:underline transition-all">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}