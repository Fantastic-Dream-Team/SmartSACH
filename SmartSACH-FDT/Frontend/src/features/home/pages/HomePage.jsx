// src/features/home/pages/HomePage.jsx
import { Link } from 'react-router-dom';
import UbicacionHora from '../../../components/UbicacionHora.jsx';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* ===== HERO SECTION CON VENTANITA ===== */}
      <section 
        className="pt-20 pb-16 px-6 relative min-h-[600px] flex items-center justify-center"
        style={{
          backgroundImage: `url('/images/chiriqui.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 text-center border border-white/20">
          <div className="mb-4">
            <UbicacionHora />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 tracking-tight">
            <span className="text-green-600">SmartSACH</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-4 max-w-2xl mx-auto font-medium">
            Gestión inteligente de recolección en Chiriquí
          </p>
          
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Consulta rutas, pagos, reporta incidencias y mantén tu servicio al día.
          </p>
          
          <div className="w-24 h-1 bg-green-500 mx-auto mt-6 rounded-full"></div>
        </div>
      </section>

      {/* ===== ¿QUIÉNES SOMOS? ===== */}
      <section className="py-16 px-6 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Texto */}
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="text-green-600">✨</span>
                ¿Quiénes somos?
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Somos un equipo comprometido con la excelencia y la sostenibilidad en cada servicio que ofrecemos. 
                Transformando tu entorno con soluciones inteligentes y personalizadas, guiados siempre por nuestros valores. 
                La satisfacción de nuestros clientes y el cuidado del ambiente son nuestra prioridad.
              </p>
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
                  <span className="text-green-600 text-xl">✓</span>
                  <span className="text-gray-700 font-medium">Calidad</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
                  <span className="text-blue-600 text-xl">✓</span>
                  <span className="text-gray-700 font-medium">Sostenibilidad</span>
                </div>
                <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full">
                  <span className="text-purple-600 text-xl">✓</span>
                  <span className="text-gray-700 font-medium">Compromiso</span>
                </div>
              </div>
            </div>
            
            {/* ===== IMAGEN CAMBIADA A camionsach.jpg ===== */}
            <div className="rounded-2xl overflow-hidden shadow-2xl ring-4 ring-green-200 relative group">
              <img 
                src="/images/camionsach.jpg" 
                alt="Camión de recolección SmartSACH" 
                className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== NUESTROS SERVICIOS ===== */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">Nuestros Servicios</h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
            Soluciones inteligentes para tu comunidad
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Servicio 1 - Recolección */}
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
                🗑️
              </div>
              <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">Recolección</h3>
              <p className="text-gray-500 text-sm text-center">Recolección oportuna de residuos en la comunidad.</p>
            </div>

            {/* Servicio 2 - Rastro */}
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
                📍
              </div>
              <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">Rastro</h3>
              <p className="text-gray-500 text-sm text-center">Sitio en campo real, la ubicación de los carrilleros.</p>
            </div>

            {/* Servicio 3 - Reportes */}
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
                📋
              </div>
              <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">Reportes</h3>
              <p className="text-gray-500 text-sm text-center">Reporta incidentes y recibe atención rápida.</p>
            </div>

            {/* Servicio 4 - Pagos */}
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
                💰
              </div>
              <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">Pagos</h3>
              <p className="text-gray-500 text-sm text-center">Contiene los pagos y suscripciones.</p>
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