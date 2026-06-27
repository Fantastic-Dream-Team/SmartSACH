// Frontend/src/features/dashboard/components/SuscripcionTab.jsx
import { useState } from 'react';
import DashboardCard from './DashboardCard.jsx';
import UbicacionHora from '../../../components/UbicacionHora.jsx';

export default function SuscripcionTab() {
  // ===== ESTADO DEL PLAN ACTUAL =====
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState({
    nombre: 'Estándar',
    precio: '$10.00',
    descripcion: 'Recolección 2 veces/semana',
    ruta: 'David Centro',
    proximoPago: '22/06/2026',
    estado: 'Activo'
  });

  // ===== LISTA DE PLANES DISPONIBLES =====
  const planesDisponibles = [
    { 
      nombre: 'Básico', 
      precio: '$5.00', 
      descripcion: 'Recolección semanal',
      ruta: 'David Centro'
    },
    { 
      nombre: 'Estándar', 
      precio: '$10.00', 
      descripcion: 'Recolección 2 veces/semana',
      ruta: 'David Centro'
    },
    { 
      nombre: 'Premium', 
      precio: '$20.00', 
      descripcion: 'Recolección diaria',
      ruta: 'David Centro'
    },
  ];

  // ===== HISTORIAL DE PAGOS =====
  const pagos = [
    { fecha: '22/06/2026', concepto: 'Suscripción mensual', monto: '$10.00', estado: '✅ Pagado' },
    { fecha: '22/05/2026', concepto: 'Suscripción mensual', monto: '$10.00', estado: '✅ Pagado' },
    { fecha: '22/04/2026', concepto: 'Suscripción mensual', monto: '$10.00', estado: '✅ Pagado' },
  ];

  // ===== FUNCIÓN PARA CAMBIAR PLAN =====
  const cambiarPlan = (plan) => {
    setCurrentPlan({
      nombre: plan.nombre,
      precio: plan.precio,
      descripcion: plan.descripcion,
      ruta: plan.ruta || currentPlan.ruta,
      proximoPago: currentPlan.proximoPago,
      estado: 'Activo'
    });
    alert(`✅ Plan cambiado exitosamente a: ${plan.nombre}`);
    setShowPlanModal(false);
  };

  // ===== FUNCIÓN PARA CANCELAR SUSCRIPCIÓN =====
  const cancelarSuscripcion = () => {
    if (confirm('¿Estás seguro de que deseas cancelar tu suscripción?')) {
      setCurrentPlan({
        ...currentPlan,
        estado: 'Cancelada'
      });
      alert('❌ Suscripción cancelada');
    }
  };

  return (
    <div>
      <UbicacionHora />
      <h2 className="text-2xl font-bold text-green-800 mb-6">Mi Suscripción</h2>

      {/* ===== PLAN ACTUAL ===== */}
      <DashboardCard title="📋 Plan Actual">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Plan:</strong> {currentPlan.nombre}</p>
            <p><strong>Descripción:</strong> {currentPlan.descripcion}</p>
            <p><strong>Monto mensual:</strong> {currentPlan.precio}</p>
          </div>
          <div>
            <p><strong>Ruta:</strong> {currentPlan.ruta}</p>
            <p><strong>Próximo pago:</strong> {currentPlan.proximoPago}</p>
            <p><strong>Estado:</strong> 
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                currentPlan.estado === 'Activo' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {currentPlan.estado}
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <button 
            onClick={() => setShowPlanModal(true)}
            className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg transition text-sm font-medium"
          >
            🔄 Cambiar Plan
          </button>
          <button 
            onClick={cancelarSuscripcion}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition text-sm font-medium"
          >
            ❌ Cancelar Suscripción
          </button>
        </div>
      </DashboardCard>

      {/* ===== PRÓXIMOS PAGOS ===== */}
      <DashboardCard className="mt-6" title="📅 Próximos Pagos">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium text-gray-600">Fecha</th>
                <th className="text-left py-2 font-medium text-gray-600">Concepto</th>
                <th className="text-left py-2 font-medium text-gray-600">Monto</th>
                <th className="text-left py-2 font-medium text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((pago, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{pago.fecha}</td>
                  <td className="py-2">{pago.concepto}</td>
                  <td className="py-2 font-medium">{pago.monto}</td>
                  <td className="py-2 text-green-600">{pago.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      {/* ===== MODAL CAMBIAR PLAN ===== */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">🔄 Cambiar Plan</h3>
            <p className="text-sm text-gray-500 mb-4">
              Plan actual: <span className="font-semibold text-green-700">{currentPlan.nombre}</span>
            </p>
            <div className="space-y-3">
              {planesDisponibles.map((plan) => (
                <button
                  key={plan.nombre}
                  onClick={() => cambiarPlan(plan)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${
                    currentPlan.nombre === plan.nombre 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">{plan.nombre}</p>
                      <p className="text-sm text-gray-500">{plan.descripcion}</p>
                      <p className="text-xs text-gray-400">Ruta: {plan.ruta}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-700">{plan.precio}</p>
                      <p className="text-xs text-gray-400">/mes</p>
                    </div>
                  </div>
                  {currentPlan.nombre === plan.nombre && (
                    <span className="inline-block mt-2 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      ✅ Plan actual
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowPlanModal(false)}
              className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}