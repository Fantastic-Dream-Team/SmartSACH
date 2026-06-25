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
    <div style={styles.wrapper}>
      {/* Banner verde superior */}
      <div style={styles.banner}>
        <span style={styles.bannerIcon}>🗺️</span>
        <span style={styles.bannerText}>Mapa de Rutas</span>
        <button
          style={styles.btnRuta}
          onClick={() => setRutaVisible(!rutaVisible)}
        >
          {rutaVisible ? "Ocultar ruta" : "Ver ruta"}
        </button>
      </div>

      {/* Mapa */}
      <MapContainer
        center={DAVID_CENTER}
        zoom={14}
        style={styles.mapa}
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
      <div style={styles.listaRutas}>
        {puntos.map((punto) => (
          <div key={punto.id} style={styles.rutaItem}>
            <span style={styles.rutaLetra}>{punto.id}</span>
            <span style={styles.rutaNombre}>{punto.nombre}</span>
          </div>
        ))}
        <button style={styles.btnAgregar}>+ Agregar ruta nueva</button>
      </div>
    </div>
  );
}

const VERDE_OSCURO = "#1b4332";
const VERDE_MID = "#2d6a4f";

const styles = {
  wrapper: {
    width: "100%",
    fontFamily: "sans-serif",
  },
  banner: {
    backgroundColor: VERDE_OSCURO,
    color: "#fff",
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  bannerIcon: {
    fontSize: "18px",
  },
  bannerText: {
    fontSize: "16px",
    fontWeight: "600",
    flex: 1,
  },
  btnRuta: {
    backgroundColor: VERDE_MID,
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "6px 14px",
    fontSize: "13px",
    cursor: "pointer",
  },
  mapa: {
    height: "320px",
    width: "100%",
  },
  listaRutas: {
    padding: "1rem 1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  rutaItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "#f4f4f4",
    borderRadius: "8px",
    padding: "10px 14px",
  },
  rutaLetra: {
    backgroundColor: VERDE_OSCURO,
    color: "#fff",
    borderRadius: "50%",
    width: "26px",
    height: "26px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "13px",
    flexShrink: 0,
  },
  rutaNombre: {
    fontSize: "14px",
    color: "#333",
  },
  btnAgregar: {
    backgroundColor: "transparent",
    border: `1px dashed ${VERDE_MID}`,
    borderRadius: "8px",
    padding: "10px",
    color: VERDE_MID,
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
};