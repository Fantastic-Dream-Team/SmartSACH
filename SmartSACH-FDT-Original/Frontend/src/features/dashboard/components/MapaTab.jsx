// Frontend/src/features/dashboard/components/MapaTab.jsx
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DashboardCard from './DashboardCard.jsx';
import UbicacionHora from '../../../components/UbicacionHora.jsx';

// Iconos
const truckIcon = L.divIcon({
  html: `<div style="background:#2563eb;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 12px rgba(37,99,235,0.5);border:2px solid white;animation:pulse 1.5s infinite;">🚛</div><style>@keyframes pulse{0%{transform:scale(1)}50%{transform:scale(1.1)}100%{transform:scale(1)}}</style>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const pointIcon = L.divIcon({
  html: `<div style="background:#22c55e;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 8px rgba(34,197,94,0.4);border:2px solid white;">🏠</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

const startIcon = L.divIcon({
  html: `<div style="background:#f59e0b;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 4px 12px rgba(245,158,11,0.5);border:2px solid white;">🏁</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const endIcon = L.divIcon({
  html: `<div style="background:#ef4444;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 4px 12px rgba(239,68,68,0.5);border:2px solid white;">🏁</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const rutasData = {
  'Ruta 1 - David Centro': {
    points: [
      { lat: 8.4286, lng: -82.4319, nombre: 'Inicio - Terminal' },
      { lat: 8.4320, lng: -82.4350, nombre: 'Parada 1 - Calle Central' },
      { lat: 8.4350, lng: -82.4380, nombre: 'Parada 2 - Parque' },
      { lat: 8.4380, lng: -82.4400, nombre: 'Parada 3 - Mercado' },
      { lat: 8.4400, lng: -82.4420, nombre: 'Parada 4 - Hospital' },
      { lat: 8.4420, lng: -82.4450, nombre: 'Fin - Plaza' },
    ],
    color: '#22c55e',
    truck: { lat: 8.4286, lng: -82.4319, nombre: 'Camión #1' }
  },
  'Ruta 2 - David Este': {
    points: [
      { lat: 8.4480, lng: -82.4400, nombre: 'Inicio - El Cangrejo' },
      { lat: 8.4500, lng: -82.4450, nombre: 'Parada 1 - Calle 92' },
      { lat: 8.4520, lng: -82.4480, nombre: 'Parada 2 - Algarrobos' },
      { lat: 8.4550, lng: -82.4500, nombre: 'Parada 3 - Nuevo Horizonte' },
      { lat: 8.4580, lng: -82.4520, nombre: 'Parada 4 - Los Ángeles' },
      { lat: 8.4600, lng: -82.4550, nombre: 'Fin - Las Lomas' },
    ],
    color: '#3b82f6',
    truck: { lat: 8.4480, lng: -82.4400, nombre: 'Camión #2' }
  },
  'Ruta 3 - Chiriquí': {
    points: [
      { lat: 8.4180, lng: -82.4200, nombre: 'Inicio - Doleguita' },
      { lat: 8.4200, lng: -82.4250, nombre: 'Parada 1 - Calle 3era' },
      { lat: 8.4220, lng: -82.4280, nombre: 'Parada 2 - San Mateo' },
      { lat: 8.4250, lng: -82.4300, nombre: 'Parada 3 - Las Lomas' },
      { lat: 8.4270, lng: -82.4320, nombre: 'Parada 4 - Los Pinos' },
      { lat: 8.4290, lng: -82.4340, nombre: 'Fin - Plaza Central' },
    ],
    color: '#f59e0b',
    truck: { lat: 8.4180, lng: -82.4200, nombre: 'Camión #3' }
  }
};

export default function MapaTab() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedRuta, setSelectedRuta] = useState('Ruta 1 - David Centro');
  const [truckMarker, setTruckMarker] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationInterval, setAnimationInterval] = useState(null);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current, { center: [8.4350, -82.4380], zoom: 14 });
    mapInstanceRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    dibujarRuta(map, selectedRuta);
    return () => { if (animationInterval) clearInterval(animationInterval); if (mapInstanceRef.current) mapInstanceRef.current.remove(); };
  }, []);

  const dibujarRuta = (map, rutaKey) => {
    const ruta = rutasData[rutaKey];
    if (!ruta) return;
    map.eachLayer((layer) => { if (layer._isRuta) map.removeLayer(layer); });
    const puntos = ruta.points;
    const latlngs = puntos.map(p => [p.lat, p.lng]);
    const polyline = L.polyline(latlngs, { color: ruta.color, weight: 4, opacity: 0.8, dashArray: '10, 10' }).addTo(map);
    polyline._isRuta = true;
    puntos.forEach((punto, index) => {
      let icon; if (index === 0) icon = startIcon; else if (index === puntos.length - 1) icon = endIcon; else icon = pointIcon;
      const marker = L.marker([punto.lat, punto.lng], { icon }).addTo(map).bindPopup(`<b>${punto.nombre}</b><br>📍 Lat: ${punto.lat.toFixed(6)}<br>📍 Lng: ${punto.lng.toFixed(6)}`);
      marker._isRuta = true;
    });
    const truck = ruta.truck;
    const marker = L.marker([truck.lat, truck.lng], { icon: truckIcon }).addTo(map).bindPopup(`<b>${truck.nombre}</b><br>🚛 Ruta: ${rutaKey}`);
    marker._isRuta = true;
    setTruckMarker(marker);
    setCurrentPointIndex(0);
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
  };

  const iniciarRecorrido = () => {
    if (isAnimating) { alert('⚠️ El recorrido ya está en curso'); return; }
    const ruta = rutasData[selectedRuta];
    if (!ruta || !truckMarker) { alert('⚠️ No se encontró la ruta o el camión'); return; }
    setIsAnimating(true);
    const puntos = ruta.points;
    let index = 0;
    const interval = setInterval(() => {
      const nextIndex = (index + 1) % puntos.length;
      const nextPoint = puntos[nextIndex];
      truckMarker.setLatLng([nextPoint.lat, nextPoint.lng]);
      truckMarker.setPopupContent(`<b>${ruta.truck.nombre}</b><br>🚛 Ruta: ${selectedRuta}<br>📍 ${nextPoint.nombre}`);
      index = nextIndex;
      setCurrentPointIndex(index);
      if (index === puntos.length - 1) {
        clearInterval(interval);
        setAnimationInterval(null);
        setIsAnimating(false);
        alert('✅ ¡Recorrido completado!');
      }
    }, 2000);
    setAnimationInterval(interval);
  };

  const detenerRecorrido = () => {
    if (animationInterval) { clearInterval(animationInterval); setAnimationInterval(null); setIsAnimating(false); alert('⏹️ Recorrido detenido'); }
    else alert('⚠️ No hay ningún recorrido en curso');
  };

  const reiniciarRecorrido = () => {
    if (isAnimating) { alert('⚠️ Detén el recorrido primero'); return; }
    const ruta = rutasData[selectedRuta];
    if (!ruta || !truckMarker) return;
    const puntoInicio = ruta.points[0];
    truckMarker.setLatLng([puntoInicio.lat, puntoInicio.lng]);
    truckMarker.setPopupContent(`<b>${ruta.truck.nombre}</b><br>🚛 Ruta: ${selectedRuta}<br>📍 ${puntoInicio.nombre}`);
    setCurrentPointIndex(0);
  };

  const cambiarRuta = (rutaKey) => {
    if (isAnimating) { alert('⚠️ Detén el recorrido primero'); return; }
    setSelectedRuta(rutaKey);
    if (mapInstanceRef.current) dibujarRuta(mapInstanceRef.current, rutaKey);
  };

  return (
    <div>
      <UbicacionHora />
      <h2 className="text-2xl font-bold text-green-800 mb-6">🚛 Mapa de Rutas y Camiones</h2>
      <DashboardCard>
        <div className="mb-4 flex flex-wrap gap-3 items-center">
          <label className="text-sm font-medium text-gray-700">Seleccionar ruta:</label>
          <select value={selectedRuta} onChange={(e) => cambiarRuta(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 text-sm">
            {Object.keys(rutasData).map((key) => <option key={key} value={key}>{key}</option>)}
          </select>
          <button onClick={iniciarRecorrido} disabled={isAnimating} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition text-sm font-medium">▶️ Iniciar recorrido</button>
          <button onClick={detenerRecorrido} disabled={!isAnimating} className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition text-sm font-medium">⏹️ Detener</button>
          <button onClick={reiniciarRecorrido} disabled={isAnimating} className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition text-sm font-medium">🔄 Reiniciar</button>
        </div>
        <div className="mb-4 p-3 rounded-lg border text-sm flex items-center gap-3">
          <span className={`inline-block w-2 h-2 rounded-full ${isAnimating ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
          <span className="text-gray-700">{isAnimating ? '🚛 Camión en movimiento...' : '⏸️ Camión detenido'}</span>
          {isAnimating && <span className="text-xs text-green-600">Parada {currentPointIndex + 1} de {rutasData[selectedRuta]?.points.length}</span>}
        </div>
        <div ref={mapRef} className="w-full h-[500px] rounded-lg border border-gray-200" style={{ minHeight: '400px' }} />
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">📋 Leyenda:</p>
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2"><span className="text-lg text-blue-500">🚛</span><span>Camion en movimiento</span></div>
            <div className="flex items-center gap-2"><span className="text-lg">🏁</span><span>Inicio/Fin de ruta</span></div>
            <div className="flex items-center gap-2"><span className="text-lg text-green-500">🏠</span><span>Parada de recolección</span></div>
            <div className="flex items-center gap-2"><span className="w-8 h-1 bg-green-500 rounded"></span><span>Camino de la ruta</span></div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm font-medium text-green-800">🚛 Información de la ruta:</p>
          <div className="mt-1 text-xs text-gray-600 space-y-1">
            <p><strong>Ruta seleccionada:</strong> {selectedRuta}</p>
            <p><strong>Paradas:</strong> {rutasData[selectedRuta]?.points.length}</p>
            <p><strong>Camion:</strong> {rutasData[selectedRuta]?.truck.nombre}</p>
            <p className="text-green-600">💡 Presiona "Iniciar recorrido" para ver el camión en movimiento</p>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}