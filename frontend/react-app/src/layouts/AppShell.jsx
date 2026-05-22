import { Link, NavLink } from "react-router-dom";
import logoWhite from "../assets/logos/logoblanco.png";
import { useAuth } from "../hooks/useAuth";

const whatsappLink = "https://wa.me/50765332344?text=Hola%20SmartSACH%2C%20necesito%20informacion%20sobre%20mi%20servicio.";

export function AppShell({ children }) {
  const { logout } = useAuth();

  return (
    <section className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <img src={logoWhite} alt="SmartSACH" />
          <strong>SmartSACH</strong>
        </div>
        <nav className="topbar-nav" aria-label="Principal">
          <NavLink to="/dashboard">Inicio</NavLink>
          <NavLink to="/perfil">Perfil</NavLink>
          <NavLink to="/pagos">Pagos</NavLink>
          <NavLink to="/nosotros">Nosotros</NavLink>
          <NavLink to="/ayuda">Ayuda</NavLink>
        </nav>
        <button className="small-pill" type="button" onClick={logout}>
          Salir
        </button>
      </header>
      <main className="app-content">{children}</main>
      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <img src={logoWhite} alt="SmartSACH blanco" className="footer-logo" />
            <p>SERVICIOS AMBIENTALES DE CHIRIQUI</p>
          </div>
          <div>
            <h4>Contáctanos</h4>
            <p>David Centro, frente a Hotel Iberia</p>
            <p>+507 8332-3342</p>
            <p>+507 6533-2344</p>
          </div>
          <div>
            <h4>Canales</h4>
            <a href={whatsappLink} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <Link to="/ayuda">Reportar servicio</Link>
          </div>
        </div>
      </footer>
    </section>
  );
}
