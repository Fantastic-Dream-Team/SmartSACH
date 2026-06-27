// src/components/Layout/Sidebar.jsx

export default function Sidebar({ usuario, estadoPago }) {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.profileBox}>
        <div style={styles.avatar}>
          {usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
        </div>
        <h4 style={styles.userName}>{usuario?.nombre || "Usuario SACH"}</h4>
        <span style={styles.userRole}>Contribuyente</span>
      </div>

      <hr style={styles.divider} />

      <div style={styles.section}>
        <h5 style={styles.sectionTitle}>Mi Cuenta</h5>
        <div style={{
          ...styles.statusBadge,
          backgroundColor: estadoPago?.estado_pago === "al_dia" ? "#d8f3dc" : "#f8d7da",
          color: estadoPago?.estado_pago === "al_dia" ? "#1b4332" : "#721c24"
        }}>
          {estadoPago?.estado_pago === "al_dia" ? "🟢 Al Día" : "🔴 Moroso"}
        </div>
      </div>

      <div style={styles.section}>
        <h5 style={styles.sectionTitle}>Servicio al Cliente</h5>
        <p style={styles.infoText}>📍 David Centro</p>
        <p style={styles.infoText}>⏰ Lun - Vie: 8am - 4pm</p>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "240px",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #e5e4e7",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    height: "calc(100vh - 56px)",
    position: "sticky",
    top: "56px",
  },
  profileBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "8px",
  },
  avatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#2d6a4f",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "bold",
  },
  userName: {
    fontSize: "16px",
    margin: 0,
    fontWeight: "600",
    color: "#08060d",
  },
  userRole: {
    fontSize: "12px",
    color: "#6b6375",
  },
  divider: {
    margin: "0",
    border: "0",
    borderTop: "1px solid #e5e4e7",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  sectionTitle: {
    fontSize: "12px",
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#2d6a4f",
    margin: 0,
    letterSpacing: "0.5px",
  },
  statusBadge: {
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    textAlign: "center",
  },
  infoText: {
    margin: 0,
    fontSize: "13px",
    color: "#6b6375",
  }
};