// Frontend/src/features/dashboard/components/PerfilTab.jsx
import { useState } from 'react';
import DashboardCard from './DashboardCard.jsx';
import UbicacionHora from '../../../components/UbicacionHora.jsx';

export default function PerfilTab({ user }) {
  // Estado inicial con los datos del usuario
  const [userData, setUserData] = useState({
    nombre: user?.nombre || 'Ángela',
    apellido: user?.apellido || 'Acosta',
    telefono: '6959-1298',
    direccion: 'David, alto de la nueva calle 92, casa 7',
    institucion: 'Instituto San José',
    correo: user?.correo || 'angelaica1527@gmail.com',
    cedula: user?.cedula || '3.721.403'
  });

  const [rutas, setRutas] = useState([
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
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showRutaModal, setShowRutaModal] = useState(false);
  const [showAddRutaModal, setShowAddRutaModal] = useState(false);
  
  // Estado temporal para edición
  const [editData, setEditData] = useState({ ...userData });
  const [editRuta, setEditRuta] = useState({ nombre: '', direccion: '', horario: '' });
  const [rutaIndex, setRutaIndex] = useState(null);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setUserData({ ...editData });
    alert('✅ Datos actualizados correctamente');
    setShowModal(false);
  };

  const handleRutaSubmit = (e) => {
    e.preventDefault();
    const updatedRutas = [...rutas];
    if (rutaIndex !== null) {
      updatedRutas[rutaIndex] = { ...editRuta };
    } else {
      updatedRutas.push({ ...editRuta });
    }
    setRutas(updatedRutas);
    alert(`✅ Ruta ${rutaIndex !== null ? 'actualizada' : 'agregada'} correctamente`);
    setShowRutaModal(false);
    setShowAddRutaModal(false);
    setEditRuta({ nombre: '', direccion: '', horario: '' });
    setRutaIndex(null);
  };

  const eliminarRuta = (index) => {
    if (confirm('¿Estás seguro de eliminar esta ruta?')) {
      const updatedRutas = rutas.filter((_, i) => i !== index);
      setRutas(updatedRutas);
      alert('✅ Ruta eliminada correctamente');
    }
  };

  const abrirEditarRuta = (index) => {
    setEditRuta({ ...rutas[index] });
    setRutaIndex(index);
    setShowRutaModal(true);
  };

  const abrirAgregarRuta = () => {
    setEditRuta({ nombre: '', direccion: '', horario: '' });
    setRutaIndex(null);
    setShowAddRutaModal(true);
  };

  return (
    <div>
      <UbicacionHora />
      
      <h2 className="text-2xl font-bold text-green-800 mb-6">Panel de usuario</h2>
      
      {/* ===== DATOS PERSONALES ===== */}
      <DashboardCard className="mb-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-3xl text-green-700">
            👤
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
            <p><strong>Nombre:</strong> {userData.nombre} {userData.apellido}</p>
            <p><strong>Institución:</strong> {userData.institucion}</p>
            <p><strong>Correo electrónico:</strong> {userData.correo}</p>
            <p><strong>Teléfono:</strong> {userData.telefono}</p>
            <p><strong>Cédula:</strong> {userData.cedula}</p>
          </div>
        </div>
        <button 
          onClick={() => { setEditData({ ...userData }); setShowModal(true); }}
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
            <p><strong>Rutas activas:</strong> {rutas.length}</p>
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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-green-800">Mis Rutas</h3>
        <button 
          onClick={abrirAgregarRuta}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
        >
          ➕ Agregar ruta
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rutas.map((ruta, index) => (
          <DashboardCard key={index} className="relative">
            <button
              onClick={() => eliminarRuta(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition"
            >
              ✕
            </button>
            <h4 className="font-bold text-green-700">{ruta.nombre}</h4>
            <p className="text-sm text-gray-600 mt-1">{ruta.direccion}</p>
            <p className="text-sm text-gray-500 mt-2">🕐 {ruta.horario}</p>
            <button 
              onClick={() => abrirEditarRuta(index)}
              className="mt-3 text-sm text-green-600 hover:text-green-700 transition font-medium"
            >
              ✏️ Editar
            </button>
          </DashboardCard>
        ))}
      </div>

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
                  Guardar cambios
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

      {/* ===== MODAL EDITAR RUTA ===== */}
      {showRutaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">✏️ Editar ruta</h3>
            <form onSubmit={handleRutaSubmit}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre de la ruta</label>
                  <input
                    type="text"
                    value={editRuta.nombre}
                    onChange={(e) => setEditRuta({...editRuta, nombre: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dirección</label>
                  <input
                    type="text"
                    value={editRuta.direccion}
                    onChange={(e) => setEditRuta({...editRuta, direccion: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Horario</label>
                  <input
                    type="text"
                    value={editRuta.horario}
                    onChange={(e) => setEditRuta({...editRuta, horario: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
                >
                  Guardar cambios
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

      {/* ===== MODAL AGREGAR RUTA ===== */}
      {showAddRutaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">➕ Agregar nueva ruta</h3>
            <form onSubmit={handleRutaSubmit}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre de la ruta</label>
                  <input
                    type="text"
                    value={editRuta.nombre}
                    onChange={(e) => setEditRuta({...editRuta, nombre: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dirección</label>
                  <input
                    type="text"
                    value={editRuta.direccion}
                    onChange={(e) => setEditRuta({...editRuta, direccion: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Horario</label>
                  <input
                    type="text"
                    value={editRuta.horario}
                    onChange={(e) => setEditRuta({...editRuta, horario: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
                >
                  Agregar ruta
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddRutaModal(false)}
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