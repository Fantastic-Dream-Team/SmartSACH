// Frontend/src/features/dashboard/components/MapaTab.jsx
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DashboardCard from './DashboardCard.jsx';

// Arreglar el problema de los íconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function MapaTab() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Inicializar el mapa
    const map = L.map(mapRef.current).setView([8.4286, -82.4319], 13);
    mapInstanceRef.current = map;

    // Capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Puntos de ejemplo (rutas)
    const puntos = [
      { lat: 8.4286, lng: -82.4319, nombre: 'Punto A - Centro' },
      { lat: 8.4386, lng: -82.4419, nombre: 'Punto B - Oishii Sushi' },
      { lat: 8.4186, lng: -82.4219, nombre: 'Punto C - Plaza' },
      { lat: 8.4486, lng: -82.4519, nombre: 'Punto D - Este' },
    ];

    // Agregar marcadores
    puntos.forEach((punto) => {
      L.marker([punto.lat, punto.lng])
        .addTo(map)
        .bindPopup(`<b>${punto.nombre}</b>`);
    });

    // Línea de ruta (polilínea)
    const routePoints = puntos.map(p => [p.lat, p.lng]);
    L.polyline(routePoints, { color: 'green', weight: 3, opacity: 0.7 })
      .addTo(map)
      .bindPopup('🗺️ Ruta de recolección');

    // Limpiar al desmontar
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">📍</span>
        <span className="text-sm text-gray-500">Chiriquí · 12 de junio 8:34 a.m.</span>
      </div>
      
      <h2 className="text-2xl font-bold text-green-800 mb-6">🗺️ Mapa de Rutas en Tiempo Real</h2>
      
      <DashboardCard>
        <div 
          ref={mapRef} 
          className="w-full h-[500px] rounded-lg"
          style={{ minHeight: '400px' }}
        />
      </DashboardCard>
    </div>
  );
}