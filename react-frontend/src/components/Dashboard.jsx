
function Dashboard({ usuario, ruta, onLogout }) {
  // Calcular días hasta el vencimiento
  const calcularDias = (fecha) => {
    if (!fecha) return null;
    const hoy = new Date();
    const vencimiento = new Date(fecha);
    const diffTime = vencimiento - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const diasRestantes = ruta ? calcularDias(ruta.proximo_vencimiento) : null;
  const esMoroso = diasRestantes !== null && diasRestantes < 0;

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>🇵🇦 SmartSACH</h2>
        </div>
        <div className="nav-user">
          <span>{usuario?.nombre} {usuario?.apellido}</span>
          <button onClick={onLogout} className="logout-btn">Cerrar sesión</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-card">
          <h1>Bienvenido, {usuario?.nombre} {usuario?.apellido}</h1>
          <p>Aquí encontrarás la información de tu ruta de recolección de basura.</p>
        </div>

        {ruta ? (
          <>
            <div className="status-card">
              <div className={`status-badge ${esMoroso ? 'moroso' : 'aldia'}`}>
                {esMoroso ? '🚨 EN MORA' : '✅ PAZ Y SALVO'}
              </div>
              {diasRestantes !== null && !esMoroso && (
                <p className="days-left">⚠️ Te quedan {diasRestantes} días para el próximo pago</p>
              )}
              {esMoroso && (
                <p className="days-left moroso-text">🔴 Tu pago está vencido. Por favor, ponte al día.</p>
              )}
            </div>

            <div className="ruta-card">
              <h2>📋 Tu Ruta de Recolección</h2>
              <div className="ruta-info">
                <div className="info-row">
                  <span className="info-label">📍 Ruta:</span>
                  <span className="info-value">{ruta.nombre_ruta}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">🗺️ Zona/Sector:</span>
                  <span className="info-value">{ruta.zona_sector}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">⏰ Horario:</span>
                  <span className="info-value">{ruta.horario_estimado}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">📅 Próximo vencimiento:</span>
                  <span className="info-value">{ruta.proximo_vencimiento}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">💰 Estado de pago:</span>
                  <span className={`info-value ${ruta.estado_pago === 'al_dia' ? 'text-success' : 'text-danger'}`}>
                    {ruta.estado_pago === 'al_dia' ? 'Paz y Salvo' : 'En Mora'}
                  </span>
                </div>
              </div>
            </div>

            <div className="actions-card">
              <h3>Acciones rápidas</h3>
              <div className="actions-buttons">
                <button className="action-btn">📞 Reportar incidencia</button>
                <button className="action-btn">📄 Ver historial de pagos</button>
                <button className="action-btn">📍 Ver mapa de ruta</button>
              </div>
            </div>
          </>
        ) : (
          <div className="error-card">
            <p>⚠️ No tienes una ruta asignada. Contacta al administrador para obtener tu ruta de recolección.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;