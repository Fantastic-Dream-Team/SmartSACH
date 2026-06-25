import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';

export default function Register() {
  const navigate = useNavigate();
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    correo: '',
    password: '',
    descripcion: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      // 1. Crear el usuario en Supabase Authentication
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.correo,
        password: formData.password,
      });

      if (authError) throw authError;

      // 2. Insertar los datos adicionales en tu tabla de perfiles/usuarios (si aplica)
      if (data.user) {
        const { error: dbError } = await supabase
          .from('usuarios') // Cambia 'usuarios' por el nombre real de tu tabla en Supabase
          .insert([
            {
              id: data.user.id, // Vincula el ID de autenticación
              nombre: formData.nombre,
              apellido: formData.apellido,
              cedula: formData.cedula,
              descripcion_ubicacion: formData.descripcion // Ubicación en David
            }
          ]);

        if (dbError) throw dbError;
      }

      setMessage({ text: '¡Cuenta creada con éxito! Redirigiendo...', type: 'success' });
      setTimeout(() => navigate('/login'), 2500);

    } catch (error) {
      setMessage({ text: error.message || 'Hubo un error en el registro', type: 'danger' });
    }
  };

  return (
    <div className="bg-light" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <main className="container py-5">
        <section className="card form-card mx-auto shadow-sm p-4" style={{ width: '100%', maxWidth: '600px' }}>
          <div className="card-body">
            <h1 className="h3 text-center mb-4">Creación de cuenta</h1>
            
            {message.text && (
              <div className={`alert alert-${message.type}`} role="alert">
                {message.text}
              </div>
            )}
            
            <form id="register-form" onSubmit={handleSubmit}>
              <div className="row text-start">
                <div className="col-md-6 mb-2">
                  <input type="text" name="nombre" className="form-control" placeholder="Nombre" onChange={handleChange} required />
                </div>
                <div className="col-md-6 mb-2">
                  <input type="text" name="apellido" className="form-control" placeholder="Apellido" onChange={handleChange} required />
                </div>
              </div>
              <input type="text" name="cedula" className="form-control mb-2" placeholder="Cédula" onChange={handleChange} required />
              <input type="email" name="correo" className="form-control mb-2" placeholder="Correo electrónico" onChange={handleChange} required />
              <input type="password" name="password" className="form-control mb-2" placeholder="Contraseña" onChange={handleChange} required />
              <textarea name="descripcion" className="form-control mb-3" placeholder="Ubicación en David" onChange={handleChange}></textarea>
              
              <button type="submit" className="btn btn-success w-100">Registrar</button>
            </form>
            
            <p className="mt-3 text-center mb-0">
              <Link to="/login">¿Ya tienes cuenta? Ingresar</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}