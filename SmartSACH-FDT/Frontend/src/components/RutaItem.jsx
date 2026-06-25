// RutaItem.jsx
// Muestra una tarjeta con la dirección de una ruta de recolección.
// Props:
//   - direccion (string): dirección del punto de recolección
//   - zona (string): nombre de la zona/sector
//   - onClick (función): acción al hacer clic (opcional)

export default function RutaItem({ direccion, zona, onClick }) {
    return (
        <div style={styles.card} onClick={onClick}>
        <div style={styles.info}>
            <span style={styles.zona}>{zona || "Sin zona"}</span>
            <span style={styles.direccion}>{direccion || "Sin dirección"}</span>
        </div>
        <div style={styles.iconWrapper}>
            {/* Ícono de mapa */}
            <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1b4332"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            >
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
            <line x1="9" y1="3" x2="9" y2="18" />
            <line x1="15" y1="6" x2="15" y2="21" />
            </svg>
        </div>
        </div>
    );
}

const styles = {
    card: {
        backgroundColor: "#f0f0f0",
        borderRadius: "10px",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        transition: "background 0.2s",
        gap: "12px",
    },
    info: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        flex: 1,
    },
    zona: {
        fontSize: "11px",
        fontWeight: "600",
        color: "#2d6a4f",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    },
    direccion: {
        fontSize: "14px",
        color: "#333",
        lineHeight: "1.4",
    },
    iconWrapper: {
        flexShrink: 0,
    },
};