import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
    { label: "Inicio", path: "/" },
    { label: "Perfil", path: "/perfil" },
    { label: "Pagos", path: "/pagos" },
    { label: "Nosotros", path: "/nosotros" },
    { label: "Ayuda", path: "/ayuda" },
];

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    return (
        <nav style={styles.nav}>
        <div style={styles.container}>
            {/* Logo */}
            <Link to="/" style={styles.logo}>
            <img src="/logo-sach.png" alt="SmartSACH" style={styles.logoImg} />
            </Link>

            {/* Links escritorio */}
            <ul style={styles.linkList}>
            {navLinks.map((link) => (
                <li key={link.path}>
                <Link
                    to={link.path}
                    style={{
                    ...styles.link,
                    ...(location.pathname === link.path ? styles.linkActive : {}),
                    }}
                >
                    {link.label}
                </Link>
                </li>
            ))}
            </ul>

            {/* Botón hamburguesa (móvil) */}
            <button
            style={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menú"
            >
            <span style={styles.bar} />
            <span style={styles.bar} />
            <span style={styles.bar} />
            </button>
        </div>

        {/* Menú móvil */}
        {menuOpen && (
            <ul style={styles.mobileMenu}>
            {navLinks.map((link) => (
                <li key={link.path}>
                <Link
                    to={link.path}
                    style={{
                    ...styles.mobileLink,
                    ...(location.pathname === link.path
                        ? styles.mobileLinkActive
                        : {}),
                    }}
                    onClick={() => setMenuOpen(false)}
                >
                    {link.label}
                </Link>
                </li>
            ))}
            </ul>
        )}
        </nav>
    );
}

const VERDE = "#2d6a4f";
const VERDE_OSCURO = "#1b4332";

const styles = {
    nav: {
        backgroundColor: VERDE_OSCURO,
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    },
    container: {
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "0 1.5rem",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    logo: {
        display: "flex",
        alignItems: "center",
        textDecoration: "none",
    },
    logoImg: {
        height: "36px",
        objectFit: "contain",
    },
    linkList: {
        display: "flex",
        gap: "0.25rem",
        listStyle: "none",
        margin: 0,
        padding: 0,
    },
    link: {
        color: "#d8f3dc",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: "500",
        padding: "6px 14px",
        borderRadius: "6px",
        transition: "background 0.2s, color 0.2s",
    },
    linkActive: {
        backgroundColor: VERDE,
        color: "#ffffff",
    },
    hamburger: {
        display: "none",
        flexDirection: "column",
        gap: "5px",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px",
    },
    bar: {
        display: "block",
        width: "22px",
        height: "2px",
        backgroundColor: "#d8f3dc",
        borderRadius: "2px",
    },
    mobileMenu: {
        listStyle: "none",
        margin: 0,
        padding: "0.5rem 1.5rem 1rem",
        backgroundColor: VERDE_OSCURO,
        borderTop: `1px solid ${VERDE}`,
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    },
    mobileLink: {
        display: "block",
        color: "#d8f3dc",
        textDecoration: "none",
        fontSize: "15px",
        padding: "10px 12px",
        borderRadius: "6px",
    },
    mobileLinkActive: {
        backgroundColor: VERDE,
        color: "#ffffff",
    },
};