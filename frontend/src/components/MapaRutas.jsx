import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix para los íconos de Leaflet con Vite
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = defaultIcon;

// Coordenadas de David, Chiriquí
const DAVID_CENTER = [8.4275, -82.4307];

// Puntos de recolección de ejemplo (se reemplazarán con datos del backend)
const puntosEjemplo = [
  { id: "A", nombre: "Punto A - Centro", coords: [8.4275, -82.4307] },
  { id: "B", nombre: "Punto B - Oishii Sushi", coords: [8.4245, -82.4280] },
  { id: "C", nombre: "Punto C - Plaza", coords: [8.4310, -82.4290] },
  { id: "D", nombre: "Punto D - Este", coords: [8.4260, -82.4240] },
];

// Íconos personalizados con letra
function crearIconoLetra(letra) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background: #1b4332;
        border: 2px solid #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 13px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      ">${letra}</div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

export default function MapaRutas() {
  // Estado para los puntos — aquí se conectará el backend después
  const [puntos] = useState(puntosEjemplo);
  const [rutaVisible, setRutaVisible] = useState(false);

  // Línea simple entre puntos (se reemplazará con OSRM después)
  const coordsRuta = puntos.map((p) => p.coords);

  return (
    <div className="w-full font-sans">
      {/* Banner verde superior */}
      <div className="bg-[#1b4332] text-white px-5 py-3 flex items-center gap-[10px]">
        <span className="text-[18px]">🗺️</span>
        <span className="text-[16px] font-semibold flex-1">Mapa de Rutas</span>
        <button
          className="bg-[#2d6a4f] text-white border-0 rounded-md px-[14px] py-[6px] text-[13px] cursor-pointer"
          onClick={() => setRutaVisible(!rutaVisible)}
        >
          {rutaVisible ? "Ocultar ruta" : "Ver ruta"}
        </button>
      </div>

      {/* Mapa */}
      <MapContainer
        center={DAVID_CENTER}
        zoom={14}
        style={{ height: "320px", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marcadores de puntos de recolección */}
        {puntos.map((punto) => (
          <Marker
            key={punto.id}
            position={punto.coords}
            icon={crearIconoLetra(punto.id)}
          >
            <Popup>
              <strong>{punto.nombre}</strong>
              <br />
              Punto de recolección
            </Popup>
          </Marker>
        ))}

        {/* Línea de ruta entre puntos */}
        {rutaVisible && (
          <Polyline
            positions={coordsRuta}
            pathOptions={{ color: "#f4a261", weight: 4, opacity: 0.8 }}
          />
        )}
      </MapContainer>

      {/* Lista de rutas debajo del mapa */}
      <div className="px-6 py-4 flex flex-col gap-2">
        {puntos.map((punto) => (
          <div
            key={punto.id}
            className="flex items-center gap-3 bg-[#f4f4f4] rounded-lg px-[14px] py-[10px]"
          >
            <span className="bg-[#1b4332] text-white rounded-full w-[26px] h-[26px] flex items-center justify-center font-bold text-[13px] shrink-0">
              {punto.id}
            </span>
            <span className="text-[14px] text-[#333]">{punto.nombre}</span>
          </div>
        ))}
        <button className="bg-transparent border border-dashed border-[#2d6a4f] rounded-lg py-[10px] text-[#2d6a4f] font-semibold cursor-pointer text-[14px]">
          + Agregar ruta nueva
        </button>
      </div>
    </div>
  );
}