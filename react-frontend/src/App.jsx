import React, { useState } from 'react';
import './App.css';

function App() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [logueado, setLogueado] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [ruta, setRuta] = useState(null);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost/SmartSACH/api/api_login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password })
      });
      const data = await response.json();

      if (data.success) {
        setLogueado(true);
        setUsuario(data);
        
        const rutasResponse = await fetch(`http://localhost/SmartSACH/api/api_rutas.php?usuario_id=${data.usuario_id}`);
        const rutasData = await rutasResponse.json();
        if (rutasData.success) {
          setRuta(rutasData.ruta);
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error al conectar con el servidor: ' + err.message);
    }
  };

  const handleLogout = () => {
    setLogueado(false);
    setUsuario(null);
    setRuta(null);
  };

  if (logueado) {
    return (
      <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px', fontFamily: 'Arial' }}>
        <h1>🏠 SmartSACH</h1>
        <h2>Bienvenido, {usuario?.nombre} {usuario?.apellido}</h2>
        
        {ruta ? (
          <div style={{ background: '#e8f4f8', padding: '20px', borderRadius: '10px', marginTop: '20px' }}>
            <h3>📋 Tu ruta de recolección:</h3>
            <p><strong>📍 Ruta:</strong> {ruta.nombre_ruta}</p>
            <p><strong>🗺️ Zona:</strong> {ruta.zona_sector}</p>
            <p><strong>⏰ Horario:</strong> {ruta.horario_estimado}</p>
            <p><strong>📅 Próximo pago:</strong> {ruta.proximo_vencimiento}</p>
            <p><strong>💰 Estado:</strong> {ruta.estado_pago}</p>
          </div>
        ) : (
          <p>Cargando tu ruta...</p>
        )}
        
        <button onClick={handleLogout} style={{ marginTop: '20px', padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', fontFamily: 'Arial' }}>
      <h1>SmartSACH - Iniciar Sesión</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '5px' }}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '5px' }}
          required
        />
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Ingresar
        </button>
      </form>
      {error && <p style={{ color: '#dc3545', marginTop: '10px' }}>{error}</p>}
    </div>
  );
}

export default App;