// src/features/dashboard/pages/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { apiRequest } from '../../../config/api.js';

// Importación de componentes del Layout según tu árbol de directorios
import Footer from '../../../components/Footer.jsx';
import Navbar from '../../../components/Layout/Navbar.jsx';
import Sidebar from '../../../components/Layout/Sidebar.jsx';
import MapaRutas from '../../../components/MapaRutas.jsx';
import RutaItem from '../../../components/RutaItem.jsx';

export default function DashboardPage({ onLogout }) {
  const [rutas, setRutas] = useState([]);
  const [estadoPago, setEstadoPago] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  // Datos locales de contingencia basados en tus sectores en David
  const rutasDePrueba = [
    { id: 1, zona: "San Mateo", direccion: "Calle principal frente al parque central" },
    { id: 2, zona: "Las Lomas", direccion: "Sector 2, entrada contiguo a la escuela" },
    { id: 3, zona: "Doleguita", direccion: "Avenida 3era Este, detrás de los comercios" }
  ];

  useEffect(() => {
    async function cargarDatos() {
      try {
        const data = await apiRequest('/api/dashboard');
        setUsuario(data.user || null);
        setEstadoPago(data.estado || { estado_pago: "al_dia", proximo_vencimiento: "30/06/2026" });
        setRutas(data.rutas && data.rutas.length > 0 ? data.rutas : rutasDePrueba);
      } catch (error) {
        console.warn("Cargando modo offline con componentes integrados.");
        
        const sesionLocal = localStorage.getItem("smartsach_user");
        if (sesionLocal) setUsuario(JSON.parse(sesionLocal));
        
        setEstadoPago({ estado_pago: "al_dia", proximo_vencimiento: "30/06/2026" });
        setRutas(rutasDePrueba);
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando SmartSACH...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.mainWrapper}>
      {/* 1. Barra de Navegación Superior */}
      <Navbar />

      {/* Cuerpo intermedio que junta Sidebar + Contenido de Rutas */}
      <div style={styles.bodyLayout}>
        {/* 2. Menú Lateral Informativo */}
        <Sidebar usuario={usuario} estadoPago={estadoPago} />

        {/* 3. Área Principal de Contenido de Datos */}
        <main style={styles.contentArea}>
          <div className="container-fluid p-0">
            <div className="row g-4">
              
              {/* Bloque del Mapa Interactivo */}
              <div className="col-12 col-xl-8">
                <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
                  <MapaRutas />
                </div>
              </div>

              {/* Bloque Lateral de Lista de Puntos Específicos */}
              <div className="col-12 col-xl-4">
                <div className="card shadow-sm border-0 p-4 bg-white rounded-3 h-100">
                  <h3 className="h5 fw-bold mb-3 text-success border-bottom pb-2">
                    📍 Puntos Críticos Asignados
                  </h3>
                  <div style={styles.itemsListContainer}>
                    {rutas.map((item) => (
                      <RutaItem 
                        key={item.id}
                        zona={item.zona}
                        direccion={item.direccion}
                        onClick={() => alert(`Centrando punto: ${item.zona}`)}
                      />
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* 4. Pie de Página */}
      <Footer />
    </div>
  );
}

const styles = {
  mainWrapper: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
  },
  bodyLayout: {
    display: "flex",
    flex: 1,
    width: "100%",
  },
  contentArea: {
    flex: 1,
    padding: "24px",
    overflowY: "auto",
    height: "calc(100vh - 56px)",
  },
  itemsListContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxHeight: "450px",
    overflowY: "auto",
    paddingRight: "4px",
  }
};