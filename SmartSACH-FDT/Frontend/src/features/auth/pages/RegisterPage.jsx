import { useState } from 'react';
import { apiRequest, saveSession } from '../../../config/api.js';

export default function RegisterPage({ onRegisterSuccess, onBackToLogin }) {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    confirmPassword: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      // TODO: confirmar el endpoint real una vez esté listo en el Backend
      const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          nombre: formData.nombre,
          correo: formData.correo,
          password: formData.password,
        }),
      });

      saveSession(data);
      onRegisterSuccess?.();
    } catch (error) {
      setErrorMsg(error.message || 'No se pudo completar el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-[420px]">
        <h2 className="text-center text-2xl font-bold mb-6 text-verde-oscuro">Crear Cuenta</h2>

        {errorMsg && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-medium text-sm">Nombre completo</label>
            <input
              type="text"
              name="nombre"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-mid focus:border-verde-mid"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium text-sm">Correo Electrónico</label>
            <input
              type="email"
              name="correo"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-mid focus:border-verde-mid"
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium text-sm">Contraseña</label>
            <input
              type="password"
              name="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-mid focus:border-verde-mid"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium text-sm">Confirmar contraseña</label>
            <input
              type="password"
              name="confirmPassword"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-mid focus:border-verde-mid"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-verde-mid hover:bg-verde-oscuro text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        {onBackToLogin && (
          <p className="text-center mt-4 text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <button onClick={onBackToLogin} className="text-verde-mid font-semibold underline bg-transparent border-0 cursor-pointer">
              Inicia sesión
            </button>
          </p>
        )}
      </div>
    </div>
  );
}