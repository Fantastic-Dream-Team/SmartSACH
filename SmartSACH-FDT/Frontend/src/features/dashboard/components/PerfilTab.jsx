// Frontend/src/features/dashboard/components/PerfilTab.jsx
import DashboardCard from './DashboardCard.jsx';

export default function PerfilTab({ user }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-green-800 mb-6">👤 Mi Perfil</h2>
      <DashboardCard>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p><strong>Nombre:</strong> {user?.nombre || 'N/A'} {user?.apellido || ''}</p>
          <p><strong>Cédula:</strong> {user?.cedula || 'N/A'}</p>
          <p><strong>Correo:</strong> {user?.correo || user?.correo_electronico || 'N/A'}</p>
          <p><strong>Teléfono:</strong> {user?.telefono || 'No registrado'}</p>
          <p className="col-span-2"><strong>Dirección:</strong> {user?.direccion || 'No registrada'}</p>
        </div>
        <button className="mt-4 bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg transition text-sm font-medium">
          ✏️ Editar Perfil
        </button>
      </DashboardCard>
    </div>
  );
}