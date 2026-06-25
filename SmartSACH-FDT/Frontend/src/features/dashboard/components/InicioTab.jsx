// Frontend/src/features/dashboard/components/InicioTab.jsx
import DashboardCard from './DashboardCard.jsx';

export default function InicioTab({ user }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-green-800 mb-6">
        Bienvenido, {user?.nombre || 'Usuario'} 👋
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard title="📋 Resumen de Cuenta">
          <p><strong>Estado:</strong> <span className="text-green-600">Activa</span></p>
          <p><strong>Rutas activas:</strong> 1</p>
          <p><strong>Próximo pago:</strong> 22/06/2026</p>
        </DashboardCard>
        <DashboardCard title="📊 Estadísticas">
          <p><strong>Recolecciones este mes:</strong> 12</p>
          <p><strong>Reportes enviados:</strong> 0</p>
          <p><strong>Pagos realizados:</strong> 5</p>
        </DashboardCard>
      </div>
    </div>
  );
}