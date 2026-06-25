import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      // Petición real de autenticación a Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: correo,
        password: password,
      });

      if (error) throw error;

      // Guardamos el token de acceso igual que en tu lógica anterior
      if (data?.session) {
        localStorage.setItem("smartsach_token", data.session.access_token);
        navigate('/dashboard');
      }
    } catch (error) {
      setMessage({ text: error.message || 'Error al iniciar sesión', type: 'danger' });
    }
  };

  return (
    <div className="auth-page bg-light" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <main className="container auth-shell d-flex justify-content-center">
        <section className="card auth-card shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
          <div className="card-body">
            <h1 className="h4 mb-4 text-success text-center">SmartSACH David</h1>
            
            {message.text && (
              <div className={`alert alert-${message.type}`} role="alert">
                {message.text}
              </div>
            )}
            
            <form id="login-form" onSubmit={handleSubmit}>
              <input 
                type="email" 
                className="form-control mb-3" 
                placeholder="Correo" 
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required 
              />
              <input 
                type="password" 
                className="form-control mb-3" 
                placeholder="Contraseña" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button type="submit" className="btn btn-success w-100">Ingresar</button>
            </form>
            
            <div className="mt-3 text-center">
              <Link to="/registro">Crear cuenta</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}