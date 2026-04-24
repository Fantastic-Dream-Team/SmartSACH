import { useEffect, useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Registro from './components/Registro';

function App() {
  const [pagina, setPagina] = useState('login');
  const [usuario, setUsuario] = useState(null);
  const [ruta, setRuta] = useState(null);

  useEffect(() => {
    // Verificar si hay sesión guardada
    const usuarioGuardado = localStorage.getItem('usuario');
    const rutaGuardada = localStorage.getItem('ruta');
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
      if (rutaGuardada) {
        setRuta(JSON.parse(rutaGuardada));
      }
      setPagina('dashboard');
    }
  }, []);

  const handleLogin = (usuarioData, rutaData) => {
    setUsuario(usuarioData);
    setRuta(rutaData);
    localStorage.setItem('usuario', JSON.stringify(usuarioData));
    localStorage.setItem('ruta', JSON.stringify(rutaData));
    setPagina('dashboard');
  };

  const handleLogout = () => {
    setUsuario(null);
    setRuta(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('ruta');
    setPagina('login');
  };

  if (pagina === 'login') {
    return <Login onLogin={handleLogin} onSwitchToRegistro={() => setPagina('registro')} />;
  }

  if (pagina === 'registro') {
    return <Registro onSwitchToLogin={() => setPagina('login')} />;
  }

  return <Dashboard usuario={usuario} ruta={ruta} onLogout={handleLogout} />;
}

export default App;