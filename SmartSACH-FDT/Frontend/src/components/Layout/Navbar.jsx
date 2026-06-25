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
    { path: '/', label: 'Homepage' },
    { path: '/planes', label: 'Planes' },
    { path: '/login', label: 'Iniciar Sesión' },
    { path: '/register', label: 'Registrarse' },
  ];

  // Links para usuarios autenticados
  const privateLinks = [
    { path: '/', label: 'Home' },
    { path: '/perfil', label: 'Perfil' },
    { path: '/mapa', label: 'Mapa' },
    { path: '/pagos', label: 'Pagos' },
    { path: '/suscripcion', label: 'Suscripción' },
  ];

  const links = isAuthenticated ? privateLinks : publicLinks;

  return (
    <nav className="bg-white shadow-md px-6 py-4 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/images/logos/Logoyname.png" 
            alt="SmartSACH" 
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition ${
                location.pathname === link.path
                  ? 'text-green-700'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated && (
            <>
              <span className="text-sm text-gray-500 border-l pl-4">
                {user?.nombre || 'Usuario'}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-700 transition font-medium"
              >
                Cerrar Sesión
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="md:hidden pt-4 pb-2 border-t border-gray-200 mt-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg transition text-sm ${
                location.pathname === link.path
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <>
              <div className="px-4 py-2 text-sm text-gray-500 border-t border-gray-200">
                {user?.nombre || 'Usuario'}
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                Cerrar Sesión
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}