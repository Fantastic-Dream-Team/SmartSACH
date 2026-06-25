// Frontend/src/features/dashboard/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../config/api.js';
import PerfilTab from '../components/PerfilTab.jsx';
import MapaTab from '../components/MapaTab.jsx';
import PagosTab from '../components/PagosTab.jsx';
import SuscripcionTab from '../components/SuscripcionTab.jsx';

export default function DashboardPage({ onLogout }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('perfil');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 rounded-full border-4 border-green-600 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const tabComponents = {
    perfil: <PerfilTab user={user} />,
    mapa: <MapaTab />,
    pagos: <PagosTab />,
    suscripcion: <SuscripcionTab />,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ ELIMINADO: <DashboardNav ... /> */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {tabComponents[activeTab] || <PerfilTab user={user} />}
      </div>
    </div>
  );
}