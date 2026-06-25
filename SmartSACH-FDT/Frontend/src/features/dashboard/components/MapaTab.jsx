// Frontend/src/features/dashboard/components/MapaTab.jsx
import DashboardCard from './DashboardCard.jsx';

export default function MapaTab() {
  const puntos = [
    { id: 'A', lugar: 'Centro' },
    { id: 'B', lugar: 'Oishii Sushi' },
    { id: 'C', lugar: 'Plaza' },
    { id: 'D', lugar: 'Este' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-green-800 mb-6">🗺️ Mapa de Rutas</h2>
      <DashboardCard>
        <p className="text-gray-600">📍 Mapa interactivo de rutas (Leaflet)</p>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {puntos.map((p) => (
            <div key={p.id} className="bg-green-50 p-3 rounded-lg text-center">
              <span className="text-2xl">📍</span>
              <p className="text-sm font-medium">Punto {p.id}</p>
              <p className="text-xs text-gray-500">{p.lugar}</p>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}