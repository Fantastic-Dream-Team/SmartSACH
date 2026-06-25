import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MapaRutas from '../components/MapaRutas';
import RutaItem from '../components/RutaItem';

export default function Dashboard() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [rutasAsignadas, setRutasAsignadas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Obtener los datos del usuario autenticado al cargar la pantalla
    const obtenerUsuarioYDatos = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          // Si hay error o no hay usuario activo, limpiamos token y pateamos al login
          localStorage.removeItem("smartsach_token");
          navigate('/login');
          return;
        }

        setUsuario(user);

        // 2. Traer las rutas reales asignadas a este usuario desde la base de datos
        // NOTA: Cambia 'rutas' por el nombre real de tu tabla en Supabase
        const { data: rutasData, error: dbError } = await supabase
          .from('rutas') 
          .select('*')
          .eq('usuario_id', user.id); // Filtra las rutas del usuario conectado

        if (!dbError && rutasData) {
          setRutasAsignadas(rutasData);
        }

      } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    obtenerUsuarioYDatos();
  }, [navigate]);

  const handleLogout = async () => {
    // Cierre de sesión real en Supabase
    await supabase.auth.signOut();
    localStorage.removeItem("smartsach_token");
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando Panel...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }} className="bg-light">
      {/* Navbar Superior integrado */}
      <Navbar />

      {/* Barra de bienvenida con email del usuario y botón Salir real */}
      <div className="container d-flex justify-content-between align-items-center mt-3 mb-2">
        <span className="text-muted small">
          Conectado como: <strong>{usuario?.email}</strong>
        </span>
        <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
          Salir
        </button>
      </div>

      <main className="container my-3" style={{ flex: 1 }}>
        <div className="row">
          
          {/* Columna Izquierda: Mapa y Tabla Dinámica */}
          <section className="col-md-8 mb-4">
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h1 className="h5 mb-0">Mis Rutas Asignadas</h1>
              </div>
              <div className="card-body p-0">
                {/* Tu mapa interactivo */}
                <MapaRutas />
              </div>
            </div>

            {/* Tabla que se llena con datos reales de Supabase */}
            <div className="card shadow-sm">
              <div className="card-header bg-white py-3">
                <h2 className="h6 mb-0 text-secondary">Horarios y Sectores de Entrega</h2>
              </div>
              <div className="card-body">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Ruta</th>
                      <th>Sector</th>
                      <th>Horario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rutasAsignadas.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center text-muted py-3">
                          No tienes rutas asignadas actualmente.
                        </td>
                      </tr>
                    ) : (
                      rutasAsignadas.map((ruta, index) => (
                        <tr key={ruta.id || index}>
                          <td><span className="badge bg-success">{ruta.letra || 'A'}</span></td>
                          <td>{ruta.sector || ruta.nombre}</td>
                          <td>{ruta.horario || 'Horario no definido'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Columna Derecha: Estado de Cuenta y Tarjetas de Puntos */}
          <aside className="col-md-4">
            <div className="card shadow-sm border-0 mb-4 text-center p-4 bg-white">
              <h2 className="h6 text-muted mb-3">Estado de Paz y Salvo</h2>
              <div id="payment-status">
                {/* Aquí podrías condicionar el badge según un campo real del usuario */}
                <span className="badge bg-success p-2 fs-6 w-100">Al Día / Sin Deudas</span>
              </div>
            </div>

            <div className="d-flex flex-column gap-2">
              <h3 className="h6 px-1 mb-1 text-secondary font-weight-bold">Detalle de Direcciones</h3>
              {/* Si tus rutas asignadas tienen direcciones, puedes renderizarlas dinámicamente aquí */}
              {rutasAsignadas.slice(0, 3).map((ruta, index) => (
                <RutaItem 
                  key={ruta.id || index}
                  zona={ruta.sector || "David"} 
                  direccion={ruta.direccion || "Dirección registrada"} 
                />
              ))}
              {/* Fallback estático si la base de datos está vacía en pruebas */}
              {rutasAsignadas.length === 0 && (
                <>
                  <RutaItem zona="David Este" direccion="Altos de las moras, calle #2, casa 7" />
                  <RutaItem zona="Algarrobos" direccion="Nuevo horizonte, al lado de la cancha, casa #7" />
                </>
              )}
            </div>
          </aside>

        </div>
      </main>

      {/* Footer integrado */}
      <Footer />
    </div>
  );
}