import { useState } from 'react';

function Registro({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    correo: '',
    password: '',
    confirmPassword: '',
    direccion: ''
  });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setCargando(true);

    try {
      const response = await fetch('http://localhost/SmartSACH/api/api_registro.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          cedula: formData.cedula,
          correo: formData.correo,
          password: formData.password,
          direccion: formData.direccion
        })
      });
      const data = await response.json();

      if (data.success) {
        setExito('Cuenta creada exitosamente. Serás redirigido al login...');
        setTimeout(() => onSwitchToLogin(), 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🇵🇦 SmartSACH</h1>
        <p className="subtitle">Crear nueva cuenta</p>
      </div>

      <div className="login-card">
        <h3>Regístrate en la plataforma</h3>
        
        {error && <div className="error-message">{error}</div>}
        {exito && <div className="success-message">{exito}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="row-2cols">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="apellido"
              placeholder="Apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
            />
          </div>
          <input
            type="text"
            name="cedula"
            placeholder="Cédula (Ej: 4-123-456)"
            value={formData.cedula}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="correo"
            placeholder="Correo electrónico"
            value={formData.correo}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmar contraseña"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <textarea
            name="direccion"
            placeholder="Dirección de ubicación"
            value={formData.direccion}
            onChange={handleChange}
            rows="3"
            required
          />
          <button type="submit" disabled={cargando}>
            {cargando ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        
        <p className="register-link">
          ¿Ya tienes cuenta? <button onClick={onSwitchToLogin} className="link-btn">Iniciar sesión</button>
        </p>
      </div>
    </div>
  );
}

export default Registro;