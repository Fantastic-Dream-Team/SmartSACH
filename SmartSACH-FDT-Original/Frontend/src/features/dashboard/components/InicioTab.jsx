// Frontend/src/features/dashboard/components/InicioTab.jsx
import DashboardCard from './DashboardCard.jsx';

export default function InicioTab({ user }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">📍</span>
        <span className="text-sm text-gray-500">Chiriquí · 12 de junio 8:34 a.m.</span>
      </div>
      
      <h2 className="text-2xl font-bold text-green-800 mb-6">
        Bienvenido a SmartSACH
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard title="📋 Resumen de Cuenta">
          <div className="space-y-2">
            <p><strong>Estado:</strong> <span className="text-green-600">Activa</span></p>
            <p><strong>Rutas activas:</strong> 1</p>
            <p><strong>Próximo pago:</strong> 22/06/2026</p>
          </div>
        </DashboardCard>
        
        <DashboardCard title="📊 Estadísticas">
          <div className="space-y-2">
            <p><strong>Recolecciones este mes:</strong> 12</p>
            <p><strong>Reportes enviados:</strong> 0</p>
            <p><strong>Pagos realizados:</strong> 5</p>
          </div>
        </DashboardCard>
      </div>
      
      <div className="mt-6 text-center text-xs text-gray-400">
        © 2026 SmartSACH - Servicios Ambientales de Chiriquí - Todos los derechos reservados
      </div>
    </div>
  );
}