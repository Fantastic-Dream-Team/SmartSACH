// src/features/home/pages/HomePage.jsx
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">SmartSACH</h1>
          <div className="flex gap-3">
            <Link
              to="/login"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-white text-indigo-600 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-indigo-600"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-800 mb-6">
            Bienvenido a <span className="text-indigo-600">SmartSACH</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Gestiona tus rutas, puntos críticos y monitorea el estado de tus servicios en tiempo real.
          </p>
          
          <div className="flex justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-lg"
            >
              Comenzar ahora
            </Link>
            <Link
              to="/register"
              className="px-8 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-50 transition-colors font-medium text-lg border border-indigo-600"
            >
              Registrarse
            </Link>
          </div>
        </div>

        {/* Features Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Mapa de Rutas</h3>
            <p className="text-gray-600">Visualiza todas tus rutas y puntos de interés en un mapa interactivo.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Puntos Críticos</h3>
            <p className="text-gray-600">Gestiona y monitorea los puntos críticos asignados a tu zona.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Dashboard</h3>
            <p className="text-gray-600">Accede a estadísticas y estado de pagos en tiempo real.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600">
          <p>© 2026 SmartSACH. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;