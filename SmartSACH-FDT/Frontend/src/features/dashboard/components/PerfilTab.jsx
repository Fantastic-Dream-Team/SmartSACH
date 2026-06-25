// Frontend/src/features/dashboard/components/PerfilTab.jsx
import { useState } from 'react';
import DashboardCard from './DashboardCard.jsx';

export default function PerfilTab({ user }) {
  const [showModal, setShowModal] = useState(false);
  const [showRutaModal, setShowRutaModal] = useState(false);
  const [editData, setEditData] = useState({
    nombre: user?.nombre || 'Ángela',
    apellido: user?.apellido || 'Acosta',
    telefono: '6959-1298',
    direccion: 'David, alto de la nueva calle 92, casa 7'
  });
  const [editRuta, setEditRuta] = useState({
    nombre: 'David Este',
    direccion: 'David, alto de la nueva calle 92, casa 7',
    horario: 'Lunes y Viernes, 7:00 AM'
  });

  const perfil = {
    nombre: user?.nombre || 'Ángela',
    apellido: user?.apellido || 'Acosta',
    institucion: 'Instituto San José',
    correo: user?.correo || 'angelaica1527@gmail.com',
    telefono: '6959-1298',
    cedula: user?.cedula || '3.721.403',
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

  const handleEditSubmit = (e) => {
    e.preventDefault();
    alert('✅ Datos actualizados correctamente');
    setShowModal(false);
  };

  const handleRutaSubmit = (e) => {
    e.preventDefault();
    alert('✅ Ruta actualizada correctamente');
    setShowRutaModal(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">📍</span>
        <span className="text-sm text-gray-500">Chiriquí · 12 de junio 8:34 a.m.</span>
      </div>
      
      <h2 className="text-2xl font-bold text-green-800 mb-6">Panel de usuario</h2>
      
      {/* ===== DATOS PERSONALES ===== */}
      <DashboardCard className="mb-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-3xl text-green-700">
            👤
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
            <p><strong>Nombre:</strong> {perfil.nombre} {perfil.apellido}</p>
            <p><strong>Institución:</strong> {perfil.institucion}</p>
            <p><strong>Correo electrónico:</strong> {perfil.correo}</p>
            <p><strong>Teléfono:</strong> {perfil.telefono}</p>
            <p><strong>Cédula:</strong> {perfil.cedula}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="mt-4 bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg transition text-sm font-medium"
        >
          ✏️ Modificar datos
        </button>
      </DashboardCard>

      {/* ===== RESUMEN Y ESTADÍSTICAS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

      {/* ===== MIS RUTAS ===== */}
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
      <button 
        onClick={() => setShowRutaModal(true)}
        className="mt-4 bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg transition text-sm font-medium"
      >
        ✏️ Modificar rutas
      </button>

      {/* ===== MODAL MODIFICAR DATOS ===== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">✏️ Modificar datos</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={editData.nombre}
                    onChange={(e) => setEditData({...editData, nombre: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Apellido</label>
                  <input
                    type="text"
                    value={editData.apellido}
                    onChange={(e) => setEditData({...editData, apellido: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="text"
                    value={editData.telefono}
                    onChange={(e) => setEditData({...editData, telefono: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dirección</label>
                  <input
                    type="text"
                    value={editData.direccion}
                    onChange={(e) => setEditData({...editData, direccion: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL MODIFICAR RUTAS ===== */}
      {showRutaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">✏️ Modificar ruta</h3>
            <form onSubmit={handleRutaSubmit}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre de la ruta</label>
                  <input
                    type="text"
                    value={editRuta.nombre}
                    onChange={(e) => setEditRuta({...editRuta, nombre: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dirección</label>
                  <input
                    type="text"
                    value={editRuta.direccion}
                    onChange={(e) => setEditRuta({...editRuta, direccion: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Horario</label>
                  <input
                    type="text"
                    value={editRuta.horario}
                    onChange={(e) => setEditRuta({...editRuta, horario: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setShowRutaModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}