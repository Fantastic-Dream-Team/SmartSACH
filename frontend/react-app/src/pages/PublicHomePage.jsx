import { useNavigate } from "react-router-dom";
import { BrandLockup } from "../components/common/BrandLockup";

export function PublicHomePage() {
  const navigate = useNavigate();
  return (
    <section className="public-home">
      <header className="public-header">
        <BrandLockup />
        <div className="public-actions">
          <button className="small-pill" type="button" onClick={() => navigate("/login")}>
            Ingresar
          </button>
          <button className="small-pill light" type="button" onClick={() => navigate("/registro")}>
            Crear cuenta
          </button>
        </div>
      </header>
      <section className="hero">
        <div>
          <h1>SmartSACH: recoleccion moderna para Chiriqui</h1>
          <p>Conectamos rutas, clientes y atencion ciudadana para un servicio mas confiable y transparente.</p>
        </div>
        <div className="placeholder-photo">SmartSACH</div>
      </section>
    </section>
  );
}
