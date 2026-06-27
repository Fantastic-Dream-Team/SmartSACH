// Frontend/src/features/dashboard/components/PagosTab.jsx
import { useState } from 'react';
import DashboardCard from './DashboardCard.jsx';
import UbicacionHora from '../../../components/UbicacionHora.jsx';

export default function PagosTab() {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const metodosPago = [
    { id: 'tarjeta', nombre: 'Tarjeta de Crédito', icon: '💳', descripcion: 'Paga con tu tarjeta VISA, Mastercard o American Express', info: 'Aceptamos tarjetas de crédito y débito. El pago se procesa de forma segura.' },
    { id: 'transferencia', nombre: 'Transferencia Bancaria', icon: '🏦', descripcion: 'Realiza una transferencia desde tu banco', info: 'Banco: Banco Nacional\nCuenta: 123-456-789\nTitular: SmartSACH S.A.' },
    { id: 'yappy', nombre: 'Yappy', icon: '📱', descripcion: 'Paga rápido con Yappy desde tu teléfono', info: 'Yappy: 6123-4567 (Nombre: SmartSACH)\nMonto: $10.00 mensuales' },
    { id: 'efectivo', nombre: 'Efectivo', icon: '💰', descripcion: 'Paga en efectivo en nuestras oficinas', info: 'Oficinas: David Centro, Calle Principal #123\nHorario: Lun-Vie 8:00am - 4:00pm' },
  ];
  const historial = [
    { fecha: '22/05/2026', monto: '$10.00', estado: 'Pagado' },
    { fecha: '22/04/2026', monto: '$10.00', estado: 'Pagado' },
    { fecha: '22/03/2026', monto: '$10.00', estado: 'Pagado' },
  ];

  return (
    <div>
      <UbicacionHora />
      <h2 className="text-2xl font-bold text-green-800 mb-6">Pagos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard title="💰 Próximo pago">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-700">$10.00</p>
            <p className="text-sm text-gray-500">Venc: 21/06/2024</p>
            <div className="mt-3"><span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-medium">✅ Al día</span></div>
          </div>
        </DashboardCard>
        <DashboardCard title="📋 Estado de cuenta">
          <div className="space-y-2">
            <p><strong>Estado:</strong> <span className="text-green-600">Al día</span></p>
            <p><strong>ID:</strong> pago-21/06/2024</p>
          </div>
        </DashboardCard>
      </div>
      <DashboardCard className="mt-6" title="💳 Selecciona tu método de pago">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metodosPago.map((metodo) => (
            <button key={metodo.id} onClick={() => setSelectedMethod(metodo)} className="border-2 border-gray-200 rounded-lg p-3 hover:border-green-500 hover:bg-green-50 transition">
              <span className="text-3xl block">{metodo.icon}</span>
              <p className="text-sm font-medium mt-1">{metodo.nombre}</p>
            </button>
          ))}
        </div>
      </DashboardCard>
      <DashboardCard className="mt-6" title="📅 Historial de Pagos">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="text-left py-2 font-medium text-gray-600">Fecha</th><th className="text-left py-2 font-medium text-gray-600">Monto</th><th className="text-left py-2 font-medium text-gray-600">Estado</th></tr></thead>
            <tbody>
              {historial.map((pago, index) => (
                <tr key={index} className="border-b"><td className="py-2">{pago.fecha}</td><td className="py-2 font-medium">{pago.monto}</td><td className="py-2 text-green-600">{pago.estado}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>
      {selectedMethod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <span className="text-5xl block">{selectedMethod.icon}</span>
              <h3 className="text-xl font-bold text-green-800 mt-2">{selectedMethod.nombre}</h3>
              <p className="text-gray-500 text-sm mt-1">{selectedMethod.descripcion}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-line">{selectedMethod.info}</div>
            <div className="flex gap-3 mt-6">
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition">Pagar ahora</button>
              <button onClick={() => setSelectedMethod(null)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}