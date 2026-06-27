// Frontend/src/features/planes/pages/PlanesPage.jsx
import { Link } from 'react-router-dom';

export default function PlanesPage() {
  const planes = [
    { nombre: 'Plan Mensual', precio: '$10.00', periodo: 'por mes', descripcion: 'Ideal para hogares que necesitan flexibilidad', features: ['✅ Recolección 2 veces por semana', '✅ 3 rutas disponibles', '✅ Mapa en tiempo real', '✅ Reporte de incidencias', '✅ Soporte prioritario'], popular: true, badge: '⭐ Más popular' },
    { nombre: 'Plan Anual', precio: '$100.00', periodo: 'por año (2 meses gratis)', descripcion: 'Ahorra 20% con el pago anual', features: ['✅ Recolección 2 veces por semana', '✅ 3 rutas disponibles', '✅ Mapa en tiempo real', '✅ Reporte de incidencias', '✅ Soporte prioritario', '✅ Descuento exclusivo'], popular: false, badge: '🏷️ Mejor precio' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 transition group mb-6">
          <span className="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
          <span className="text-sm font-medium">Volver al Home</span>
        </Link>
        <h1 className="text-4xl font-bold text-center text-green-800 mb-4">Elige tu Plan</h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Suscríbete a SmartSACH y disfruta de una gestión inteligente de recolección en Chiriquí.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {planes.map((plan, index) => (
            <div key={index} className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-transform hover:scale-105 ${plan.popular ? 'border-4 border-green-500 relative' : 'border border-gray-200'}`}>
              {plan.badge && <div className={`text-center text-white text-sm font-bold py-1.5 ${plan.popular ? 'bg-green-500' : 'bg-blue-500'}`}>{plan.badge}</div>}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-800">{plan.nombre}</h3>
                <p className="text-gray-500 text-sm mt-1">{plan.descripcion}</p>
                <div className="mt-4"><span className="text-4xl font-bold text-green-700">{plan.precio}</span><span className="text-gray-500 text-sm ml-2">{plan.periodo}</span></div>
                <ul className="mt-6 space-y-3">{plan.features.map((feature, i) => <li key={i} className="text-sm text-gray-700">{feature}</li>)}</ul>
                <Link to="/register" state={{ from: 'planes' }} className="mt-8 block w-full text-center bg-gradient-to-r from-green-700 to-green-600 text-white py-3 rounded-xl font-semibold transition hover:shadow-lg hover:-translate-y-0.5">Suscribirse ahora</Link>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-400 text-xs mt-12">© 2026 SmartSACH - Servicios Ambientales de Chiriquí</p>
      </div>
    </div>
  );
}