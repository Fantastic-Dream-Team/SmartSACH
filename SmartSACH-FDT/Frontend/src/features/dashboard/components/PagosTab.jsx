// Frontend/src/features/dashboard/components/PagosTab.jsx
import DashboardCard from './DashboardCard.jsx';

export default function PagosTab() {
  const historial = [
    { fecha: '22/05/2026', monto: '$10.00', estado: 'Pagado' },
    { fecha: '22/04/2026', monto: '$10.00', estado: 'Pagado' },
    { fecha: '22/03/2026', monto: '$10.00', estado: 'Pagado' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-green-800 mb-6">💰 Pagos</h2>
      <DashboardCard>
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <p><strong>Próximo pago:</strong> $10.00</p>
            <p><strong>Fecha:</strong> 22/06/2026</p>
          </div>
          <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">✅ Al día</span>
        </div>
        <div className="mt-4">
          <h4 className="font-medium text-gray-700">Historial de pagos</h4>
          <div className="mt-2 space-y-2">
            {historial.map((pago, i) => (
              <div key={i} className="flex justify-between text-sm border-b pb-2">
                <span>{pago.fecha}</span>
                <span className="font-medium">{pago.monto}</span>
                <span className="text-green-600">{pago.estado}</span>
              </div>
            ))}
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}