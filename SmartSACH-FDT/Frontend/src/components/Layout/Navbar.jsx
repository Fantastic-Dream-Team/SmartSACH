// Frontend/src/components/Layout/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getToken, logout } from '../../config/api.js';

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = getToken();
    const storedUser = localStorage.getItem('user');
    setIsAuthenticated(!!token);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [location]);

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  // Links para usuarios NO autenticados
  const publicLinks = [
    { path: '/', label: '🏠 Home' },
    { path: '/planes', label: '📋 Planes' },
    { path: '/login', label: '🔑 Iniciar Sesión' },
    { path: '/register', label: '📝 Registrarse' },
  ];

  // Links para usuarios autenticados
  const privateLinks = [
    { path: '/', label: '🏠 Home' },
    { path: '/perfil', label: '👤 Perfil' },
    { path: '/mapa', label: '🗺️ Mapa' },
    { path: '/pagos', label: '💰 Pagos' },
    { path: '/suscripcion', label: '📋 Suscripción' },
  ];

  const links = isAuthenticated ? privateLinks : publicLinks;

  return (
    <header className="bg-gradient-to-r from-green-800 to-green-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-4">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">♻️</span>
          <span>SmartSACH</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                location.pathname === link.path
                  ? 'bg-white/20 text-white'
                  : 'hover:bg-white/10 text-white/80'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated && (
            <div className="flex items-center gap-3 ml-4 border-l border-white/20 pl-4">
              <span className="text-sm text-white/90">
                👋 {user?.nombre || 'Usuario'}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition text-sm font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden py-4 border-t border-white/10">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg transition text-sm ${
                location.pathname === link.path
                  ? 'bg-white/20 text-white'
                  : 'hover:bg-white/10 text-white/80'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <>
              <div className="px-4 py-2 text-sm text-white/80">
                👋 {user?.nombre || 'Usuario'}
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-white/10 rounded-lg transition"
              >
                Cerrar Sesión
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}