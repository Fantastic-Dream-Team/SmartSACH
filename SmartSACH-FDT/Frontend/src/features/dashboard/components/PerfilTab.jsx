// Frontend/src/features/dashboard/components/PerfilTab.jsx
import DashboardCard from './DashboardCard.jsx';

export default function PerfilTab({ user }) {
  // Datos de ejemplo (después vendrán de la base de datos)
  const perfil = {
    nombre: 'Ángela Acosta',
    institucion: 'Instituto San José',
    correo: user?.correo || 'angelaica1527@gmail.com',
    telefono: '6959-1298',
    cedula: '3.721.403',
    rutas: [
      {
        nombre: 'David Este',
        direccion: 'David, alto de la nueva calle 92, casa 7',
        horario: 'Lunes y Viernes, 7:00 AM'
      },
      {
        nombre: 'Algarrobos',
        direccion: 'Nuevo horizonte al lado de la cancha, casa 87',
        horario: 'Martes y Jueves, 9:00 AM'
      }
    ]
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">📍</span>
        <span className="text-sm text-gray-500">Chiriquí · 12 de junio 8:34 a.m.</span>
      </div>
      
      <h2 className="text-2xl font-bold text-green-800 mb-6">Panel de usuario</h2>
      
      {/* Datos personales */}
      <DashboardCard className="mb-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-3xl text-green-700">
            👤
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
            <p><strong>Nombre:</strong> {perfil.nombre}</p>
            <p><strong>Institución:</strong> {perfil.institucion}</p>
            <p><strong>Correo electrónico:</strong> {perfil.correo}</p>
            <p><strong>Teléfono:</strong> {perfil.telefono}</p>
            <p><strong>Cédula:</strong> {perfil.cedula}</p>
          </div>
        </div>
        <button className="mt-4 bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg transition text-sm font-medium">
          ✏️ Modificar datos
        </button>
      </DashboardCard>
      
      {/* Mis Rutas */}
      <h3 className="text-xl font-bold text-green-800 mb-4">Mis Rutas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {perfil.rutas.map((ruta, index) => (
          <DashboardCard key={index}>
            <h4 className="font-bold text-green-700">{ruta.nombre}</h4>
            <p className="text-sm text-gray-600 mt-1">{ruta.direccion}</p>
            <p className="text-sm text-gray-500 mt-2">🕐 {ruta.horario}</p>
          </DashboardCard>
        ))}
      </div>
      <button className="mt-4 bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg transition text-sm font-medium">
        ✏️ Modificar rutas
      </button>
    </div>
  );
}