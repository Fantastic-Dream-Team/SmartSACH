// Frontend/src/features/dashboard/components/SuscripcionTab.jsx
import DashboardCard from './DashboardCard.jsx';

export default function SuscripcionTab() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-green-800 mb-6">📋 Suscripción</h2>
      <DashboardCard>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Plan:</strong> Estándar</p>
            <p><strong>Ruta:</strong> David Centro</p>
            <p><strong>Monto:</strong> $10.00/mes</p>
          </div>
          <div>
            <p><strong>Estado:</strong> <span className="text-green-600">Activa</span></p>
            <p><strong>Próximo pago:</strong> 22/06/2026</p>
          </div>
        </div>
        <button className="mt-4 bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg transition text-sm font-medium">
          🔄 Cambiar Plan
        </button>
      </DashboardCard>
    </div>
  );
}