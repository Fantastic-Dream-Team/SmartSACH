// src/features/home/pages/HomePage.jsx
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* ✅ ELIMINADO: el Navbar ya está en App.jsx */}

      {/* Hero Section */}
      <section 
        className="pt-24 pb-16 px-6 relative min-h-[600px] flex items-center"
        style={{
          backgroundImage: `url('/images/chiriqui.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center text-white">
          <div className="inline-block bg-green-600/80 text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
            📍 Chiriquí · 12 de junio 8:34 a.m.
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="text-green-400">SmartSACH</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-6 max-w-3xl mx-auto">
            Gestión inteligente de recolección en Chiriquí
          </p>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Consulta rutas, pagos, reporta incidencias y mantén tu servicio al día.
          </p>
          
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              to="/login"
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-lg"
            >
              Comenzar ahora
            </Link>
            <Link
              to="/register"
              className="px-8 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-lg transition-colors font-medium text-lg border border-white/50"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </section>

      {/* ¿Quiénes somos? */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">¿Quiénes somos?</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Somos un equipo comprometido con la excelencia y la sostenibilidad en cada servicio que ofrecemos. 
                Transformando tu entorno con soluciones inteligentes y personalizadas, guiados siempre por nuestros valores. 
                La satisfacción de nuestros clientes y el cuidado del ambiente son nuestra prioridad.
              </p>
              <div className="flex flex-wrap gap-6 mt-8">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-2xl">✓</span>
                  <span className="text-gray-700 font-medium">Calidad</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-2xl">✓</span>
                  <span className="text-gray-700 font-medium">Sostenibilidad</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-2xl">✓</span>
                  <span className="text-gray-700 font-medium">Compromiso</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img src="/images/Trabajadores.jpg" alt="Nuestro equipo" className="w-full h-80 object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Nuestros Servicios</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-green-500">
              <div className="text-4xl mb-3">🗑️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Recolección</h3>
              <p className="text-gray-600">Recolección oportuna de residuos en la comunidad.</p>
              <img src="/images/camionsach.jpg" alt="Recolección" className="w-full h-24 object-cover rounded-lg mt-3" />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-blue-500">
              <div className="text-4xl mb-3">📍</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Rastro</h3>
              <p className="text-gray-600">Sitio en campo real, la ubicación de los carrilleros.</p>
              <img src="/images/trabajador.jpg" alt="Rastro" className="w-full h-24 object-cover rounded-lg mt-3" />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-yellow-500">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Reportes</h3>
              <p className="text-gray-600">Reporta incidentes y recibe atención rápida.</p>
              <div className="w-full h-24 bg-yellow-100 rounded-lg mt-3 flex items-center justify-center text-3xl">📋</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-purple-500">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Pagos</h3>
              <p className="text-gray-600">Contiene los pagos y suscripciones.</p>
              <div className="w-full h-24 bg-purple-100 rounded-lg mt-3 flex items-center justify-center text-3xl">💰</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-800 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <img src="/images/logos/logoblanco.png" alt="SmartSACH" className="h-12 w-auto mx-auto mb-4" />
          <p className="text-sm opacity-80">© 2026 SmartSACH. Todos los derechos reservados.</p>
          <p className="text-xs opacity-60 mt-2">Gestión inteligente de recolección en Chiriquí</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;