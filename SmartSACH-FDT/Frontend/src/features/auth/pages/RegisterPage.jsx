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
    detalleAdicional: '',
  });
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Validaciones de contraseña
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('❌ Debe tener al menos 8 caracteres');
    if (!/[A-Z]/.test(password)) errors.push('❌ Debe tener al menos una mayúscula');
    if (!/[a-z]/.test(password)) errors.push('❌ Debe tener al menos una minúscula');
    if (!/[0-9]/.test(password)) errors.push('❌ Debe tener al menos un número');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('❌ Debe tener al menos un símbolo (!@#$%^&*)');
    return errors;
  };

  // ===== FORMATO DE CÉDULA PANAMEÑA =====
  const formatCedula = (value) => {
    // Solo números
    const numbers = value.replace(/\D/g, '');
    
    // Máximo 9 dígitos
    if (numbers.length > 9) return formData.cedula;
    
    if (numbers.length <= 1) {
      return numbers;
    } else if (numbers.length <= 3) {
      return `${numbers.slice(0, 1)}-${numbers.slice(1)}`;
    } else if (numbers.length === 4) {
      return `${numbers.slice(0, 1)}-${numbers.slice(1)}`;
    } else if (numbers.length <= 5) {
      // X-XXXX o XX-XXX (provincia de 2 dígitos)
      if (numbers.startsWith('1') && numbers.length >= 2) {
        return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
      } else {
        return `${numbers.slice(0, 1)}-${numbers.slice(1)}`;
      }
    } else if (numbers.length <= 7) {
      // X-XXX-XX o X-XXXX-XX o XX-XXX-XX
      if (numbers.startsWith('1') && numbers.length >= 2) {
        return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5)}`;
      } else {
        return `${numbers.slice(0, 1)}-${numbers.slice(1, 4)}-${numbers.slice(4)}`;
      }
    } else {
      // Formato final
      if (numbers.startsWith('1') && numbers.length >= 2) {
        return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5)}`;
      } else if (numbers.length === 8) {
        return `${numbers.slice(0, 1)}-${numbers.slice(1, 4)}-${numbers.slice(4)}`;
      } else {
        return `${numbers.slice(0, 1)}-${numbers.slice(1, 5)}-${numbers.slice(5)}`;
      }
    }
  };

  // Formatear teléfono automáticamente
  const formatTelefono = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length > 8) return formData.telefono;
    if (numbers.length <= 4) return numbers;
    return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cedula') {
      formattedValue = formatCedula(value);
    }
    if (name === 'telefono') {
      formattedValue = formatTelefono(value);
    }
    if (name === 'nombre' || name === 'apellido') {
      if (value.length > 15) return;
    }
    if (name === 'detalleAdicional') {
      if (value.length > 50) return;
    }

    setFormData({ ...formData, [name]: formattedValue });
    
    // Limpiar errores del campo
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }

    // Validar contraseña en tiempo real
    if (name === 'password') {
      setPasswordErrors(validatePassword(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneralError('');
    setSuccessMsg('');

    // Validaciones
    const newErrors = {};
    
    // Nombre y apellido
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    else if (formData.nombre.length > 15) newErrors.nombre = 'Máximo 15 caracteres';
    
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es obligatorio';
    else if (formData.apellido.length > 15) newErrors.apellido = 'Máximo 15 caracteres';
    
    // Cédula (8-9 dígitos)
    const cedulaLimpia = formData.cedula.replace(/-/g, '');
    if (!formData.cedula.trim()) {
      newErrors.cedula = 'La cédula es obligatoria';
    } else if (!/^\d+$/.test(cedulaLimpia)) {
      newErrors.cedula = 'Solo números (sin letras ni caracteres especiales)';
    } else if (cedulaLimpia.length < 8 || cedulaLimpia.length > 9) {
      newErrors.cedula = 'La cédula debe tener 8 o 9 dígitos (ej: 4-789-962, 4-7896-962 o 10-789-962)';
    }
    
    // Correo
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es obligatorio';
    } else if (!formData.correo.includes('@') || !formData.correo.includes('.')) {
      newErrors.correo = 'Ingresa un correo válido (ej: usuario@dominio.com)';
    }
    
    // Teléfono (8 dígitos)
    const telefonoLimpio = formData.telefono.replace(/-/g, '');
    if (formData.telefono.trim() && !/^\d+$/.test(telefonoLimpio)) {
      newErrors.telefono = 'Solo números';
    } else if (formData.telefono.trim() && telefonoLimpio.length !== 8) {
      newErrors.telefono = 'Debe tener 8 dígitos (ej: 6589-8962)';
    }
    
    // Contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (passwordErrors.length > 0) {
      newErrors.password = 'La contraseña no cumple los requisitos';
    }
    
    // Confirmar contraseña
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    // Dirección
    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es obligatoria';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          cedula: formData.cedula.replace(/-/g, ''),
          correo: formData.correo,
          telefono: formData.telefono.replace(/-/g, ''),
          password: formData.password,
          direccion: formData.direccion,
          detalleAdicional: formData.detalleAdicional,
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
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        <h2 className="text-2xl font-bold text-green-800 text-center mb-2">Crear Cuenta</h2>
        <p className="text-gray-500 text-center text-sm mb-6">Completa tus datos para registrarte</p>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium text-sm mb-1">Nombre * (max 15)</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border ${errors.nombre ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm`}
                placeholder="Juan"
                maxLength={15}
                disabled={loading}
              />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
              <p className="text-xs text-gray-400 mt-1">{formData.nombre.length}/15</p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium text-sm mb-1">Apellido * (max 15)</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border ${errors.apellido ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm`}
                placeholder="Pérez"
                maxLength={15}
                disabled={loading}
              />
              {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido}</p>}
              <p className="text-xs text-gray-400 mt-1">{formData.apellido.length}/15</p>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium text-sm mb-1">
              Cédula * (8-9 dígitos)
            </label>
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border ${errors.cedula ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm`}
              placeholder="4-789-962"
              maxLength={11}
              disabled={loading}
            />
            {errors.cedula && <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>}
            <p className="text-xs text-gray-400 mt-1">
              Formatos: X-XXX-XXXX (8), X-XXXX-XXXX (9) o XX-XXX-XXXX (9)
            </p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium text-sm mb-1">Correo electrónico *</label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border ${errors.correo ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm`}
              placeholder="tu@email.com"
              disabled={loading}
            />
            {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo}</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-medium text-sm mb-1">Teléfono (8 dígitos, ej: 6589-8962)</label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border ${errors.telefono ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm`}
              placeholder="6589-8962"
              maxLength={9}
              disabled={loading}
            />
            {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium text-sm mb-1">Contraseña *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm`}
                placeholder="8+ caracteres"
                disabled={loading}
              />
              {passwordErrors.length > 0 && (
                <div className="mt-1 space-y-1">
                  {passwordErrors.map((err, i) => (
                    <p key={i} className="text-red-500 text-xs">{err}</p>
                  ))}
                </div>
              )}
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-gray-700 font-medium text-sm mb-1">Confirmar contraseña *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm`}
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
              className={`w-full px-4 py-2.5 border ${errors.direccion ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm`}
              placeholder="Ej: Calle 34, casa 17, Boquete"
              disabled={loading}
            />
            {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion}</p>}
            <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
              <span className="text-yellow-500">🔄</span>
              <span className="text-gray-400">Próximamente: Ubicación en tiempo real</span>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium text-sm mb-1">Detalle adicional (máximo 50 caracteres)</label>
            <textarea
              name="detalleAdicional"
              value={formData.detalleAdicional}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all text-sm"
              placeholder="Ej: Puntos de referencia, indicaciones para el recolector..."
              maxLength={50}
              disabled={loading}
            />
            <p className="text-xs text-gray-400 mt-1">{formData.detalleAdicional.length}/50</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-4">
          ¿Ya tienes cuenta? <Link to="/login" className="text-green-700 font-semibold hover:underline">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}