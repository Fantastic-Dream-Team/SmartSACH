// Frontend/src/features/dashboard/components/DashboardNav.jsx
export default function DashboardNav({ activeTab, setActiveTab, user, onLogout }) {
  const tabs = [
    { id: 'inicio', label: '📊 Inicio' },
    { id: 'perfil', label: '👤 Perfil' },
    { id: 'mapa', label: '🗺️ Mapa' },
    { id: 'pagos', label: '💰 Pagos' },
    { id: 'suscripcion', label: '📋 Suscripción' },
  ];

  return (
    <header className="bg-gradient-to-r from-green-800 to-green-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">♻️</span> SmartSACH
        </h2>
        
        <nav className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                activeTab === tab.id 
                  ? 'bg-white/20 text-white' 
                  : 'hover:bg-white/10 text-white/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <span className="text-sm text-white/90">
            👋 Hola, {user?.nombre || 'Usuario'}
          </span>
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
}