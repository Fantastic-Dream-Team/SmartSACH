export function RegisterBridgePage() {
  return (
    <section className="register-page">
      <div className="register-card panel">
        <h1 className="register-title">Registro en migracion</h1>
        <p>
          El registro principal sigue activo en la version actual para no interrumpir operaciones.
          Puedes usarlo mientras terminamos su migracion a React.
        </p>
        <a className="primary-button inline-link" href="/frontend/#/registro">
          Abrir registro actual
        </a>
      </div>
    </section>
  );
}
