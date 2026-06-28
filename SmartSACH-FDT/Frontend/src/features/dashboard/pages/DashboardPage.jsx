// Frontend/src/features/dashboard/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../config/api.js';
import PerfilTab from '../components/PerfilTab.jsx';
import MapaTab from '../components/MapaTab.jsx';
import PagosTab from '../components/PagosTab.jsx';
import SuscripcionTab from '../components/SuscripcionTab.jsx';
import InicioTab from '../components/InicioTab.jsx';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('inicio');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Intenta obtener usuario de localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error al parsear usuario:', e);
      }
    }
    // Si no hay usuario en localStorage pero sí hay token, está autorizado
    // El usuario será cargado por el tab correspondiente si es necesario
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 rounded-full border-4 border-green-600 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const tabComponents = {
    inicio: <InicioTab user={user} />,
    perfil: <PerfilTab user={user} />,
    mapa: <MapaTab />,
    pagos: <PagosTab />,
    suscripcion: <SuscripcionTab />,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar del Dashboard */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-green-800">SmartSACH Dashboard</h1>
          <div className="flex gap-4">
            <nav className="flex gap-1">
              {[
                { id: 'inicio', label: '🏠 Inicio' },
                { id: 'perfil', label: '👤 Perfil' },
                { id: 'mapa', label: '🗺️ Mapa' },
                { id: 'pagos', label: '💳 Pagos' },
                { id: 'suscripcion', label: '📋 Suscripción' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeTab === tab.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
            >
              🚪 Salir
            </button>
          </div>
        </div>
      </div>

      {/* Contenido del Tab */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {tabComponents[activeTab] || <InicioTab user={user} />}
      </div>
    </div>
  );
}