// Frontend/src/features/dashboard/components/MapaTab.jsx
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DashboardCard from './DashboardCard.jsx';

// ===== ICONOS PERSONALIZADOS =====
// Icono para marcadores de rutas predefinidas
const routeIcon = L.divIcon({
  className: 'custom-route-marker',
  html: '📍',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowSize: [0, 0],
});

// Icono para marcadores creados por el usuario
const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `
    <div style="
      background: #22c55e;
      color: white;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(34, 197, 94, 0.5);
      border: 2px solid white;
      transition: transform 0.2s;
    ">
      📌
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowSize: [0, 0],
});

// Icono para el punto de inicio (casa)
const homeIcon = L.divIcon({
  className: 'custom-home-marker',
  html: `
    <div style="
      background: #2563eb;
      color: white;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.5);
      border: 2px solid white;
    ">
      🏠
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
  shadowSize: [0, 0],
});

// Icono para ubicación actual (GPS)
const gpsIcon = L.divIcon({
  className: 'custom-gps-marker',
  html: `
    <div style="
      background: #ef4444;
      color: white;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
      border: 2px solid white;
      animation: pulse 1.5s infinite;
    ">
      📍
    </div>
    <style>
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.15); }
        100% { transform: scale(1); }
      }
    </style>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
  shadowSize: [0, 0],
});

// ===== COMPONENTE PRINCIPAL =====
export default function MapaTab() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [lastClicked, setLastClicked] = useState(null);
  const [gpsPosition, setGpsPosition] = useState(null);
  const [isLoadingGps, setIsLoadingGps] = useState(false);

  // Puntos predefinidos (rutas) con iconos personalizados
  const puntosRuta = [
    { lat: 8.4286, lng: -82.4319, nombre: '🏛️ Punto A - Centro', icon: routeIcon },
    { lat: 8.4386, lng: -82.4419, nombre: '🍣 Punto B - Oishii Sushi', icon: routeIcon },
    { lat: 8.4186, lng: -82.4219, nombre: '🏢 Punto C - Plaza', icon: routeIcon },
    { lat: 8.4486, lng: -82.4519, nombre: '🌳 Punto D - Este', icon: routeIcon },
  ];

  // ===== INICIALIZAR MAPA =====
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [8.4286, -82.4319],
      zoom: 14,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    // Capa de mapa
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Agregar marcadores de rutas predefinidas con iconos personalizados
    puntosRuta.forEach((punto) => {
      const marker = L.marker([punto.lat, punto.lng], {
        icon: punto.icon,
        draggable: false,
      })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: Arial, sans-serif; padding: 4px;">
            <b>${punto.nombre}</b><br>
            <span style="color: #666; font-size: 12px;">
              📍 Lat: ${punto.lat.toFixed(6)}<br>
              📍 Lng: ${punto.lng.toFixed(6)}
            </span>
          </div>
        `);
    });

    // Agregar marcador de "casa" en el centro
    const homeMarker = L.marker([8.4286, -82.4319], {
      icon: homeIcon,
      draggable: false,
    })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: Arial, sans-serif; padding: 4px;">
          <b>🏠 Ubicación principal</b><br>
          <span style="color: #666; font-size: 12px;">
            📍 Lat: 8.4286<br>
            📍 Lng: -82.4319
          </span>
        </div>
      `);

    // ===== EVENTO: CLIC EN EL MAPA =====
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      
      // Crear marcador en la posición clickeada con icono personalizado
      const newMarker = L.marker([lat, lng], {
        icon: userIcon,
        draggable: true,
      })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: Arial, sans-serif; padding: 4px;">
            <b>📍 Ubicación seleccionada</b><br>
            <span style="color: #666; font-size: 12px;">
              📍 Lat: ${lat.toFixed(6)}<br>
              📍 Lng: ${lng.toFixed(6)}
            </span>
            <br>
            <button 
              onclick="window.eliminarMarcador(${markers.length})"
              style="
                background: #ef4444; 
                color: white; 
                border: none; 
                padding: 4px 12px; 
                border-radius: 6px; 
                cursor: pointer;
                font-size: 12px;
                margin-top: 4px;
              "
            >
              Eliminar
            </button>
          </div>
        `);

      // Guardar marcador
      setMarkers(prev => [...prev, newMarker]);
      setSelectedPosition({ lat, lng });
      setLastClicked({ lat, lng });

      // Abrir popup automáticamente
      setTimeout(() => {
        newMarker.openPopup();
      }, 100);

      // Evento: cuando se arrastra el marcador
      newMarker.on('dragend', () => {
        const pos = newMarker.getLatLng();
        setSelectedPosition({ lat: pos.lat, lng: pos.lng });
        newMarker.setPopupContent(`
          <div style="font-family: Arial, sans-serif; padding: 4px;">
            <b>📍 Ubicación movida</b><br>
            <span style="color: #666; font-size: 12px;">
              📍 Lat: ${pos.lat.toFixed(6)}<br>
              📍 Lng: ${pos.lng.toFixed(6)}
            </span>
          </div>
        `);
        newMarker.openPopup();
      });
    });

    // ===== LIMPIAR AL DESMONTAR =====
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // ===== FUNCIÓN: OBTENER UBICACIÓN GPS =====
  const obtenerGps = () => {
    if (!navigator.geolocation) {
      alert('❌ Tu navegador no soporta geolocalización');
      return;
    }

    setIsLoadingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGpsPosition({ lat: latitude, lng: longitude });
        setIsLoadingGps(false);

        // Agregar marcador GPS en el mapa
        if (mapInstanceRef.current) {
          const gpsMarker = L.marker([latitude, longitude], {
            icon: gpsIcon,
            draggable: false,
          })
            .addTo(mapInstanceRef.current)
            .bindPopup(`
              <div style="font-family: Arial, sans-serif; padding: 4px;">
                <b>📍 Tu ubicación actual</b><br>
                <span style="color: #666; font-size: 12px;">
                  📍 Lat: ${latitude.toFixed(6)}<br>
                  📍 Lng: ${longitude.toFixed(6)}
                </span>
              </div>
            `);
          
          // Centrar el mapa en la ubicación GPS
          mapInstanceRef.current.setView([latitude, longitude], 15);
          setTimeout(() => gpsMarker.openPopup(), 500);
        }
      },
      (error) => {
        setIsLoadingGps(false);
        alert(`❌ Error al obtener ubicación: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // ===== FUNCIÓN: ELIMINAR ÚLTIMO MARCADOR =====
  const eliminarUltimoMarcador = () => {
    if (markers.length === 0) return;
    const lastMarker = markers[markers.length - 1];
    if (mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(lastMarker);
    }
    setMarkers(prev => prev.slice(0, -1));
    if (markers.length === 1) {
      setSelectedPosition(null);
      setLastClicked(null);
    }
  };

  // ===== FUNCIÓN: LIMPIAR TODOS LOS MARCADORES =====
  const limpiarMarcadores = () => {
    markers.forEach(marker => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(marker);
      }
    });
    setMarkers([]);
    setSelectedPosition(null);
    setLastClicked(null);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">📍</span>
        <span className="text-sm text-gray-500">Chiriquí · 12 de junio 8:34 a.m.</span>
      </div>
      
      <h2 className="text-2xl font-bold text-green-800 mb-6">🗺️ Mapa de Rutas en Tiempo Real</h2>
      
      <DashboardCard>
        {/* ===== CONTROLES SUPERIORES ===== */}
        <div className="mb-4 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
            <span className="text-green-600">●</span>
            <span>Haz clic en el mapa para agregar ubicación</span>
          </div>
          
          {selectedPosition && (
            <div className="flex items-center gap-2 text-sm bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
              <span>📍</span>
              <span className="text-blue-700 font-medium">
                Lat: {selectedPosition.lat.toFixed(6)} | Lng: {selectedPosition.lng.toFixed(6)}
              </span>
            </div>
          )}
          
          <button
            onClick={obtenerGps}
            disabled={isLoadingGps}
            className="ml-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition text-sm font-medium disabled:opacity-50"
          >
            {isLoadingGps ? '🔄 Buscando...' : '📍 Mi ubicación'}
          </button>
        </div>

        {/* ===== MAPA ===== */}
        <div 
          ref={mapRef} 
          className="w-full h-[450px] rounded-lg border border-gray-200"
          style={{ minHeight: '400px' }}
        />

        {/* ===== CONTROLES INFERIORES ===== */}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={eliminarUltimoMarcador}
            disabled={markers.length === 0}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition text-sm font-medium disabled:cursor-not-allowed"
          >
            🔄 Deshacer último
          </button>
          <button
            onClick={limpiarMarcadores}
            disabled={markers.length === 0}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition text-sm font-medium disabled:cursor-not-allowed"
          >
            🗑️ Limpiar todos
          </button>
          <button
            onClick={() => {
              if (selectedPosition) {
                alert(`📍 Ubicación guardada:\nLat: ${selectedPosition.lat.toFixed(6)}\nLng: ${selectedPosition.lng.toFixed(6)}`);
              } else {
                alert('⚠️ No hay ubicación seleccionada');
              }
            }}
            disabled={!selectedPosition}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition text-sm font-medium disabled:cursor-not-allowed"
          >
            💾 Guardar ubicación
          </button>
          {gpsPosition && (
            <div className="flex items-center gap-2 text-sm bg-green-50 px-3 py-2 rounded-lg border border-green-200 ml-auto">
              <span className="text-green-600">📡</span>
              <span className="text-green-700 font-medium">
                GPS activo
              </span>
            </div>
          )}
        </div>

        {/* ===== LEYENDA ===== */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">📋 Leyenda de iconos:</p>
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-lg">📍</span>
              <span>Ruta predefinida</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg text-green-500">📌</span>
              <span>Tu ubicación marcada</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🏠</span>
              <span>Ubicación principal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg text-red-500">📍</span>
              <span>GPS en vivo</span>
            </div>
          </div>
        </div>

        {/* ===== CONSEJOS ===== */}
        <div className="mt-4 text-xs text-gray-400 border-t pt-3">
          <p>💡 Consejos:</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Haz clic en cualquier punto del mapa para agregar una ubicación</li>
            <li>Arrastra los marcadores verdes para ajustar la posición</li>
            <li>Haz clic en un marcador para ver sus coordenadas</li>
            <li>Usa "Mi ubicación" para ir a tu posición GPS actual</li>
          </ul>
        </div>
      </DashboardCard>
    </div>
  );
}