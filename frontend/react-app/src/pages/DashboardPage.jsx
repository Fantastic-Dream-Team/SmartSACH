import { AppShell } from "../layouts/AppShell";
import { useAuth } from "../hooks/useAuth";

export function DashboardPage() {
  const { user } = useAuth();
  return (
    <AppShell>
      <section className="panel hero-panel">
        <div>
          <h1>Panel de usuario</h1>
          <p>Bienvenido {user?.nombre || "usuario"}. Esta vista ya usa React y queda lista para migrar mapa, rutas y pagos.</p>
        </div>
        <div className="hero-cards">
          <article>
            <strong>0</strong>
            <span>rutas activas</span>
          </article>
          <article>
            <strong>$0.00</strong>
            <span>saldo pendiente</span>
          </article>
        </div>
      </section>
      <section className="panel">
        <h2>Siguiente paso</h2>
        <p>En la siguiente fase migramos el mapa Leaflet y consumo de `dashboardOverview()` desde React.</p>
      </section>
    </AppShell>
  );
}
