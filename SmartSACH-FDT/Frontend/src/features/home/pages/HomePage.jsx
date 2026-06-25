// src/features/home/pages/HomePage.jsx
import { Link } from 'react-router-dom';
import UbicacionHora from '../../../components/UbicacionHora.jsx';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section 
        className="pt-20 pb-16 px-6 relative min-h-[600px] flex items-center"
        style={{
          backgroundImage: `url('/images/chiriqui.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center text-white">
          {/* Ubicación y hora en tiempo real */}
          <div className="mb-6">
            <UbicacionHora />
          </div>
          
          {/* Título */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight">
            <span className="text-green-400">SmartSACH</span>
          </h1>
          
          {/* Subtítulo */}
          <p className="text-xl md:text-2xl lg:text-3xl text-white/90 mb-6 max-w-3xl mx-auto font-light">
            Gestión inteligente de recolección en Chiriquí
          </p>
          
          {/* Descripción */}
          <p className="text-base md:text-lg text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Consulta rutas, pagos, reporta incidencias y mantén tu servicio al día.
          </p>
          
          {/* ✅ BOTONES ELIMINADOS - ya están en el Navbar */}
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