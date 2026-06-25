import { useState } from 'react';
import { apiRequest, saveSession } from '../../../config/api.js';

export default function LoginPage({ onLoginSuccess }) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      // Consumimos tu endpoint del Backend levantado en Render
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ correo, password }),
      });

      // Guardamos el token y el usuario en el localStorage
      saveSession(data);
      
      // Le avisamos a App.jsx que re-valide la sesión para dar acceso
      onLoginSuccess();
    } catch (error) {
      setErrorMsg(error.message || 'Credenciales incorrectas');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ width: '400px' }}>
        <h2 className="text-center mb-4">Iniciar Sesión</h2>
        
        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Correo Electrónico</label>
            <input 
              type="email" 
              className="form-control" 
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Ingresar</button>
        </form>
      </div>
    </div>
  );
}