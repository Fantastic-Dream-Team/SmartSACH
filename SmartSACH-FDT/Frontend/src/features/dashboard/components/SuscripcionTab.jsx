// Frontend/src/features/dashboard/components/SuscripcionTab.jsx
import DashboardCard from './DashboardCard.jsx';

export default function SuscripcionTab() {
  const pagos = [
    { fecha: '22/06/2026', concepto: 'Suscripción mensual', monto: '$10.00', estado: '✅ Pagado' },
    { fecha: '22/05/2026', concepto: 'Suscripción mensual', monto: '$10.00', estado: '✅ Pagado' },
    { fecha: '22/04/2026', concepto: 'Suscripción mensual', monto: '$10.00', estado: '✅ Pagado' },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">📍</span>
        <span className="text-sm text-gray-500">Chiriquí · 12 de junio 8:34 a.m.</span>
      </div>
      
      <h2 className="text-2xl font-bold text-green-800 mb-6">Mi Suscripción</h2>
      
      {/* Plan Actual */}
      <DashboardCard title="📋 Plan Actual">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Plan:</strong> Estándar - Ruta David Centro</p>
            <p><strong>Monto mensual:</strong> $10.00</p>
          </div>
          <div>
            <p><strong>Próximo pago:</strong> 22/06/2026</p>
            <p><strong>Estado:</strong> <span className="text-green-600">Activo</span></p>
          </div>
        </div>
        <button className="mt-4 bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg transition text-sm font-medium">
          🔄 Cambiar Plan
        </button>
      </DashboardCard>
      
      {/* Próximos Pagos */}
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
    </div>
  );
}