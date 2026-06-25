export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>

        {/* Logo + nombre */}
        <div style={styles.brand}>
          <img src="/logo-sach.png" alt="SACH" style={styles.logo} />
          <span style={styles.brandName}>SACH</span>
        </div>

        {/* Contáctanos label */}
        <span style={styles.contactLabel}>Contáctanos</span>

        {/* Info de contacto */}
        <div style={styles.contactGroup}>
          <p style={styles.contactItem}>📍 David centro, frente a hotel luar</p>
          <p style={styles.contactItem}>📞 58328-234223</p>
          <p style={styles.contactItem}>💬 +507 6532-2344</p>
          <p style={styles.contactItem}>📷 Sachchirique</p>
        </div>

      </div>

      {/* Línea inferior */}
      <div style={styles.bottom}>
        <p style={styles.bottomText}>
          Derechos reservados © SmartSACH S.A.
        </p>
      </div>
    </footer>
  );
}

const VERDE_OSCURO = "#1b4332";
const VERDE_MID = "#2d6a4f";

const styles = {
  footer: {
    backgroundColor: VERDE_OSCURO,
    color: "#d8f3dc",
    marginTop: "auto",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "1.5rem 2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "1rem",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logo: {
    height: "40px",
    objectFit: "contain",
  },
  brandName: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#ffffff",
    letterSpacing: "0.5px",
  },
  contactLabel: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#ffffff",
  },
  contactGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  contactItem: {
    margin: 0,
    fontSize: "13px",
    color: "#d8f3dc",
  },
  bottom: {
    borderTop: `1px solid ${VERDE_MID}`,
    textAlign: "center",
    padding: "0.75rem 2rem",
  },
  bottomText: {
    margin: 0,
    fontSize: "12px",
    color: "#95d5b2",
  },
};