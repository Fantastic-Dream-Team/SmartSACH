// Frontend/src/features/dashboard/components/PagosTab.jsx
import DashboardCard from './DashboardCard.jsx';

export default function PagosTab() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">📍</span>
        <span className="text-sm text-gray-500">Chiriquí · 12 de junio 8:34 a.m.</span>
      </div>
      
      <h2 className="text-2xl font-bold text-green-800 mb-6">Pagos</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Próximo pago */}
        <DashboardCard title="💰 Próximo pago">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-700">$10.00</p>
            <p className="text-sm text-gray-500">Venc: 21/06/2024</p>
            <div className="mt-3">
              <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-medium">
                ✅ Al día
              </span>
            </div>
          </div>
        </DashboardCard>
        
        {/* Estado de cuenta */}
        <DashboardCard title="📋 Estado de cuenta">
          <div className="space-y-2">
            <p><strong>Estado:</strong> <span className="text-green-600">Al día</span></p>
            <p><strong>ID:</strong> pago-21/06/2024</p>
          </div>
        </DashboardCard>
      </div>
      
      {/* Método de pago */}
      <DashboardCard className="mt-6" title="💳 Selecciona tu método de pago">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="border-2 border-gray-200 rounded-lg p-3 hover:border-green-500 transition">
            <span className="text-2xl">💳</span>
            <p className="text-sm">Tarjeta</p>
          </button>
          <button className="border-2 border-gray-200 rounded-lg p-3 hover:border-green-500 transition">
            <span className="text-2xl">🏦</span>
            <p className="text-sm">Transferencia</p>
          </button>
          <button className="border-2 border-gray-200 rounded-lg p-3 hover:border-green-500 transition">
            <span className="text-2xl">📱</span>
            <p className="text-sm">Yappy</p>
          </button>
          <button className="border-2 border-gray-200 rounded-lg p-3 hover:border-green-500 transition">
            <span className="text-2xl">💰</span>
            <p className="text-sm">Efectivo</p>
          </button>
        </div>
      </DashboardCard>
    </div>
  );
}