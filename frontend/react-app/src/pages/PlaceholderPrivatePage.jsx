import { AppShell } from "../layouts/AppShell";

export function PlaceholderPrivatePage({ title }) {
  return (
    <AppShell>
      <section className="panel">
        <h1>{title}</h1>
        <p>Esta seccion se migrara en la siguiente fase, manteniendo los estilos y reglas de negocio actuales.</p>
      </section>
    </AppShell>
  );
}
