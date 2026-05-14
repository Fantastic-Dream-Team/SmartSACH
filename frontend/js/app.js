const app = document.querySelector("#app");
const api = window.SmartSachAPI;

let currentUser = null;
let registerMap = null;
let registerMarker = null;
let dashboardMap = null;

const whatsappLink = "https://wa.me/50765332344?text=Hola%20SmartSACH%2C%20necesito%20informacion%20sobre%20mi%20servicio.";

function navigate(route) {
  window.location.hash = route;
}

function money(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("es-PA", { style: "currency", currency: "USD" }).format(amount);
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-PA");
}

function setAlert(container, message, type = "error") {
  if (!container) return;
  container.innerHTML = message ? `<div class="alert ${type}">${api.sanitizeText(message)}</div>` : "";
}

function fieldValue(form, name) {
  return form.elements[name]?.value.trim() || "";
}

function showFieldErrors(form, errors = {}) {
  form.querySelectorAll("[data-error-for]").forEach((item) => {
    const field = item.getAttribute("data-error-for");
    item.textContent = errors[field] || "";
  });
}

function destroyMaps() {
  if (registerMap) {
    registerMap.remove();
    registerMap = null;
    registerMarker = null;
  }
  if (dashboardMap) {
    dashboardMap.remove();
    dashboardMap = null;
  }
}

function sharedNav(active = "inicio") {
  return `
    <header class="topbar">
      <div class="topbar-brand">
        <img src="../assets/img/logos/logoblanco.png" alt="SmartSACH" />
        <strong>SmartSACH</strong>
      </div>
      <nav class="topbar-nav" aria-label="Principal">
        <a class="${active === "inicio" ? "active" : ""}" href="#/dashboard">Inicio</a>
        <a class="${active === "perfil" ? "active" : ""}" href="#/perfil">Perfil</a>
        <a class="${active === "pagos" ? "active" : ""}" href="#/pagos">Pagos</a>
        <a class="${active === "nosotros" ? "active" : ""}" href="#/nosotros">Nosotros</a>
        <a class="${active === "ayuda" ? "active" : ""}" href="#/ayuda">Ayuda</a>
      </nav>
      <button class="small-pill" type="button" data-logout>Salir</button>
    </header>
  `;
}

function sharedFooter() {
  return `
    <footer class="site-footer">
      <div class="footer-grid">
        <div>
          <img src="../assets/img/logos/logoblanco.png" alt="SmartSACH blanco" class="footer-logo" />
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
          <a href="${whatsappLink}" target="_blank" rel="noreferrer">WhatsApp</a>
          <a href="#/ayuda">Reportar servicio</a>
        </div>
      </div>
    </footer>
  `;
}

function appShell(active, content) {
  app.innerHTML = `
    <section class="app-shell">
      ${sharedNav(active)}
      <main class="app-content">${content}</main>
      ${sharedFooter()}
    </section>
  `;
  app.querySelector("[data-logout]")?.addEventListener("click", logout);
}

async function logout() {
  await api.logout().catch(() => null);
  currentUser = null;
  navigate("/login");
}

function brandLockup() {
  return `
    <div class="brand-lockup">
      <img src="../assets/img/logos/Logoyname.png" alt="Logo SmartSACH" />
    </div>
  `;
}

function validateLogin(form) {
  const errors = {};
  const correo = fieldValue(form, "correo");
  const password = fieldValue(form, "password");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) errors.correo = "Correo inválido.";
  if (!password) errors.password = "Ingresa tu contraseña.";
  return errors;
}

function validateRegister(form, location) {
  const errors = {};
  ["nombre", "apellido", "cedula", "correo", "password", "confirmPassword", "direccion", "descripcion"].forEach((field) => {
    if (!fieldValue(form, field)) errors[field] = "Obligatorio.";
  });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue(form, "correo"))) errors.correo = "Correo inválido.";
  if (!/^[A-Z0-9]{1,3}-?\d{1,4}-?\d{1,6}$/i.test(fieldValue(form, "cedula"))) errors.cedula = "Formato inválido.";
  const password = fieldValue(form, "password");
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(password)) errors.password = "Mínimo 8 con mayúscula, minúscula y número.";
  if (password !== fieldValue(form, "confirmPassword")) errors.confirmPassword = "No coincide.";
  if (location.latitud === null || location.longitud === null) errors.ubicacion = "Selecciona la ubicación.";
  return errors;
}

async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const data = await response.json();
  return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

async function searchAddress(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const data = await response.json();
  return data[0] || null;
}

function renderLogin() {
  destroyMaps();
  app.innerHTML = `
    <section class="auth-shell">
      <div class="login-grid">
        <aside class="welcome-panel">
          <div class="welcome-content">
            <h2>SmartSACH</h2>
            <h1>Gestión inteligente de recolección en Chiriquí</h1>
            <p>Consulta rutas, pagos, reporta incidencias y mantén tu servicio al día.</p>
            <button class="outline-pill" type="button" data-public-home>Navegar</button>
          </div>
        </aside>
        <section class="form-panel">
          <div class="corner-circle" aria-hidden="true"></div>
          <div class="login-card">
            ${brandLockup()}
            <p class="login-subtitle">Inicia sesión para entrar a tu panel</p>
            <div data-alert></div>
            <form id="loginForm" novalidate>
              <div class="field-stack">
                <label class="field">
                  <span class="sr-only">Correo electrónico</span>
                  <input class="input" type="email" name="correo" placeholder="Correo electrónico" autocomplete="email" required />
                  <small class="field-error" data-error-for="correo"></small>
                </label>
                <label class="field">
                  <span class="sr-only">Contraseña</span>
                  <input class="input" type="password" name="password" placeholder="Contraseña" autocomplete="current-password" required />
                  <small class="field-error" data-error-for="password"></small>
                </label>
              </div>
              <button class="ghost-btn" type="button" data-forgot>Olvidé mi contraseña</button>
              <div>
                <button class="primary-button" type="submit">Ingresar</button>
              </div>
              <p class="switch-line">No tienes cuenta? <button class="link-button" type="button" data-register>Crear cuenta</button></p>
            </form>
          </div>
        </section>
      </div>
    </section>
  `;

  const form = app.querySelector("#loginForm");
  const alert = app.querySelector("[data-alert]");
  app.querySelector("[data-register]").addEventListener("click", () => navigate("/registro"));
  app.querySelector("[data-public-home]").addEventListener("click", () => navigate("/public-home"));
  app.querySelector("[data-forgot]").addEventListener("click", async () => {
    const correo = fieldValue(form, "correo");
    if (!correo) {
      setAlert(alert, "Escribe tu correo para enviarte instrucciones.");
      return;
    }
    try {
      const payload = await api.forgotPassword({ correo });
      setAlert(alert, payload.message, "ok");
    } catch (error) {
      setAlert(alert, error.message);
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const errors = validateLogin(form);
    showFieldErrors(form, errors);
    if (Object.keys(errors).length) return;
    const button = form.querySelector("[type='submit']");
    button.disabled = true;
    button.textContent = "Ingresando...";
    try {
      const payload = await api.login({
        correo: fieldValue(form, "correo"),
        password: fieldValue(form, "password"),
      });
      currentUser = payload.user;
      navigate("/dashboard");
    } catch (error) {
      showFieldErrors(form, error.errors);
      setAlert(alert, error.message);
    } finally {
      button.disabled = false;
      button.textContent = "Ingresar";
    }
  });
}

function renderPublicHome() {
  destroyMaps();
  app.innerHTML = `
    <section class="public-home">
      <header class="public-header">
        ${brandLockup()}
        <div class="public-actions">
          <button class="small-pill" type="button" data-login>Ingresar</button>
          <button class="small-pill light" type="button" data-register>Crear cuenta</button>
        </div>
      </header>

      <section class="hero">
        <div>
          <h1>SmartSACH: recolección moderna para Chiriquí</h1>
          <p>Conectamos rutas, clientes y atención ciudadana para un servicio de basura más confiable y transparente.</p>
        </div>
        <img src="../assets/img/contenido/camionsach.jpg" alt="Camión de recolección SmartSACH" />
      </section>

      <section class="public-grid">
        <article>
          <h3>Rutas organizadas</h3>
          <p>Visualiza por zonas el recorrido estimado de los camiones y mantente informado sobre próximas visitas en tu sector.</p>
          <img src="../assets/img/contenido/chiriqui.jpg" alt="Vista de Chiriquí" />
        </article>
        <article>
          <h3>Atención al cliente</h3>
          <p>Recibimos reportes, quejas y recomendaciones para mejorar continuamente el servicio de recolección residencial y comercial.</p>
          <img src="../assets/img/contenido/Trabajadores.jpg" alt="Equipo de trabajo SmartSACH" />
        </article>
        <article>
          <h3>Compromiso ambiental</h3>
          <p>Promovemos disposición responsable de residuos para contribuir a comunidades limpias, seguras y sostenibles.</p>
          <img src="../assets/img/contenido/trabajador.jpg" alt="Trabajador SmartSACH" />
        </article>
      </section>

      ${sharedFooter()}
    </section>
  `;
  app.querySelector("[data-login]").addEventListener("click", () => navigate("/login"));
  app.querySelector("[data-register]").addEventListener("click", () => navigate("/registro"));
}

function registerField(label, name, placeholder, type = "text") {
  return `
    <div class="field-row">
      <label for="${name}">${label}</label>
      <div>
        <input class="input" id="${name}" name="${name}" type="${type}" placeholder="${placeholder}" />
        <small class="field-error" data-error-for="${name}"></small>
      </div>
    </div>
  `;
}

function renderRegister() {
  destroyMaps();
  app.innerHTML = `
    <section class="register-page">
      <div class="register-card">
        ${brandLockup()}
        <h1 class="register-title">Crear cuenta en SmartSACH</h1>
        <div data-alert></div>
        <form id="registerForm" class="register-form" novalidate>
          ${registerField("Nombre", "nombre", "Fabian")}
          ${registerField("Apellido", "apellido", "Arauz")}
          ${registerField("Cédula", "cedula", "4-826-1202")}
          ${registerField("Correo", "correo", "correo@ejemplo.com", "email")}
          ${registerField("Teléfono (opcional)", "telefono", "+507 6000-0000")}
          ${registerField("Contraseña", "password", "********", "password")}
          ${registerField("Confirmar contraseña", "confirmPassword", "********", "password")}
          <h2 class="route-title">Ubicación de servicio</h2>
          <div class="location-tools">
            <label for="direccion">Dirección</label>
            <input class="input" id="direccion" name="direccion" placeholder="David, Chiriquí, Panamá" required />
            <button class="icon-button" type="button" data-search title="Buscar dirección">⌕</button>
          </div>
          <small class="field-error" data-error-for="direccion"></small>
          <small class="field-error" data-error-for="ubicacion"></small>
          <div class="map-wrap"><div id="map"></div></div>
          <div class="location-preview" data-preview>Selecciona un punto en el mapa o usa tu ubicación actual.</div>
          <button class="icon-button" type="button" data-geolocate title="Usar mi ubicación">⌖</button>
          <label class="description-label" for="descripcion">Descripción de referencia</label>
          <textarea class="textarea" id="descripcion" name="descripcion" placeholder="Frente a... Casa color... Local..." required></textarea>
          <small class="field-error" data-error-for="descripcion"></small>
          <div><button class="primary-button" type="submit">Crear cuenta</button></div>
        </form>
        <p class="switch-line">¿Ya tienes cuenta? <button class="link-button" type="button" data-login>Ingresar</button></p>
      </div>
    </section>
  `;

  const location = { latitud: 8.4273, longitud: -82.4309, direccion: "" };
  const form = app.querySelector("#registerForm");
  const alert = app.querySelector("[data-alert]");
  const preview = app.querySelector("[data-preview]");

  setupRegisterMap(location, form, preview);
  app.querySelector("[data-login]").addEventListener("click", () => navigate("/login"));

  app.querySelector("[data-geolocate]").addEventListener("click", () => {
    if (!navigator.geolocation) {
      setAlert(alert, "Tu navegador no permite geolocalización.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => updateRegisterLocation(position.coords.latitude, position.coords.longitude, location, form, preview, true),
      () => setAlert(alert, "No se pudo obtener tu ubicación.")
    );
  });

  app.querySelector("[data-search]").addEventListener("click", async () => {
    const query = fieldValue(form, "direccion");
    if (!query) return;
    try {
      const result = await searchAddress(query);
      if (!result) {
        setAlert(alert, "No encontramos esa dirección.");
        return;
      }
      await updateRegisterLocation(Number(result.lat), Number(result.lon), location, form, preview, false, result.display_name);
    } catch {
      setAlert(alert, "No se pudo buscar la dirección.");
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const errors = validateRegister(form, location);
    showFieldErrors(form, errors);
    if (Object.keys(errors).length) return;
    const button = form.querySelector("[type='submit']");
    button.disabled = true;
    button.textContent = "Creando...";
    try {
      const payload = await api.register({
        nombre: fieldValue(form, "nombre"),
        apellido: fieldValue(form, "apellido"),
        cedula: fieldValue(form, "cedula"),
        correo: fieldValue(form, "correo"),
        telefono: fieldValue(form, "telefono"),
        password: fieldValue(form, "password"),
        confirmPassword: fieldValue(form, "confirmPassword"),
        direccion: fieldValue(form, "direccion"),
        descripcion: fieldValue(form, "descripcion"),
        latitud: location.latitud,
        longitud: location.longitud,
      });
      currentUser = payload.user;
      navigate("/dashboard");
    } catch (error) {
      showFieldErrors(form, error.errors);
      setAlert(alert, error.message);
    } finally {
      button.disabled = false;
      button.textContent = "Crear cuenta";
    }
  });
}

function setupRegisterMap(location, form, preview) {
  destroyMaps();
  registerMap = L.map("map", { zoomControl: true }).setView([location.latitud, location.longitud], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap",
  }).addTo(registerMap);
  registerMarker = L.marker([location.latitud, location.longitud], { draggable: true }).addTo(registerMap);
  registerMarker.on("dragend", () => {
    const latLng = registerMarker.getLatLng();
    updateRegisterLocation(latLng.lat, latLng.lng, location, form, preview, true);
  });
  registerMap.on("click", (event) => updateRegisterLocation(event.latlng.lat, event.latlng.lng, location, form, preview, true));
  setTimeout(() => registerMap.invalidateSize(), 200);
  updateRegisterPreview(location, form, preview);
}

async function updateRegisterLocation(lat, lng, location, form, preview, lookupAddress, knownAddress = "") {
  location.latitud = Number(lat.toFixed(8));
  location.longitud = Number(lng.toFixed(8));
  if (registerMap && registerMarker) {
    registerMap.setView([location.latitud, location.longitud], Math.max(registerMap.getZoom(), 15));
    registerMarker.setLatLng([location.latitud, location.longitud]);
  }
  if (knownAddress) {
    location.direccion = knownAddress;
    form.elements.direccion.value = knownAddress;
  } else if (lookupAddress) {
    try {
      location.direccion = await reverseGeocode(location.latitud, location.longitud);
      form.elements.direccion.value = location.direccion;
    } catch {
      location.direccion = `${location.latitud}, ${location.longitud}`;
    }
  }
  updateRegisterPreview(location, form, preview);
}

function updateRegisterPreview(location, form, preview) {
  preview.textContent = `${form.elements.direccion.value || "David, Chiriquí, Panamá"} · Lat ${location.latitud}, Lng ${location.longitud}`;
}

async function ensureUser() {
  if (currentUser) return currentUser;
  try {
    const payload = await api.me();
    currentUser = payload.user;
    return currentUser;
  } catch {
    navigate("/login");
    return null;
  }
}

function mapRouteStatus(status) {
  if (status === "moroso") return "Pendiente";
  if (status === "al_dia") return "Al día";
  return status || "-";
}

async function renderDashboard() {
  destroyMaps();
  const user = await ensureUser();
  if (!user) return;

  let payload;
  try {
    payload = await api.dashboardOverview();
  } catch (error) {
    appShell("inicio", `<section class="panel"><h2>Error</h2><p>${api.sanitizeText(error.message)}</p></section>`);
    return;
  }

  const routes = payload.routes || [];
  const summary = payload.summary || {};

  appShell("inicio", `
    <section class="panel hero-panel">
      <div>
        <h1>Panel de usuario</h1>
        <p>Bienvenido ${api.sanitizeText(user.nombre)}. Aquí puedes monitorear tus rutas, pagos y reportar incidencias.</p>
      </div>
      <div class="hero-cards">
        <article>
          <strong>${summary.rutas_activas || 0}</strong>
          <span>rutas activas</span>
        </article>
        <article>
          <strong>${money(summary.deuda_estimada || 0)}</strong>
          <span>${summary.suscripciones_morosas > 0 ? "saldo pendiente" : "paz y salvo"}</span>
        </article>
      </div>
    </section>

    <section class="panel route-panel">
      <h2>Mapa de Rutas</h2>
      <div id="dashboardMap" class="dashboard-map"></div>
      <div class="route-list">
        ${(routes.length ? routes : []).map((route) => `
          <article class="route-item">
            <h3>${api.sanitizeText(route.nombre_ruta)} · ${api.sanitizeText(route.nombre_referencia || "Ubicación")}</h3>
            <p>Horario: ${api.sanitizeText(route.horario_estimado || "-")}</p>
            <p>Estado: ${mapRouteStatus(route.estado_pago)}</p>
            <p>Próximo pago: ${formatDate(route.proximo_vencimiento)}</p>
          </article>
        `).join("") || "<p>No hay rutas activas todavía.</p>"}
      </div>
    </section>

    <section class="quick-links">
      <a href="#/perfil" class="box-link">Gestionar perfil y rutas</a>
      <a href="#/pagos" class="box-link">Ver pagos y trazabilidad</a>
    </section>

    <section class="panel report-panel">
      <h2>Todo bien con tu servicio de recolección?</h2>
      <p>Déjanos una opinión o queja para mejorar la calidad del servicio.</p>
      <div data-report-alert></div>
      <form id="reportForm" class="report-form">
        <select name="ubicacion_id" required>
          ${(routes || []).map((route) => `<option value="${route.ubicacion_id}">${api.sanitizeText(route.nombre_referencia || route.nombre_ruta)}</option>`).join("")}
        </select>
        <select name="tipo_incidencia">
          <option value="no_paso_camion">No pasó el camión</option>
          <option value="mala_atencion">Mala atención</option>
          <option value="desperdicio_en_via">Basura en la vía</option>
          <option value="recomendacion">Recomendación</option>
          <option value="otro">Otro</option>
        </select>
        <textarea name="descripcion" placeholder="Describe tu comentario..." required></textarea>
        <button class="primary-button" type="submit">Reportar servicio</button>
      </form>
    </section>
  `);

  renderDashboardMap(payload.route_points || [], routes);

  const reportForm = app.querySelector("#reportForm");
  const reportAlert = app.querySelector("[data-report-alert]");
  reportForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = reportForm.querySelector("button[type='submit']");
    button.disabled = true;
    button.textContent = "Enviando...";
    try {
      const response = await api.createReport({
        ubicacion_id: Number(reportForm.elements.ubicacion_id.value),
        tipo_incidencia: reportForm.elements.tipo_incidencia.value,
        descripcion: reportForm.elements.descripcion.value.trim(),
      });
      setAlert(reportAlert, response.message, "ok");
      reportForm.reset();
    } catch (error) {
      setAlert(reportAlert, error.message, "error");
    } finally {
      button.disabled = false;
      button.textContent = "Reportar servicio";
    }
  });
}

function renderDashboardMap(routePoints, routes) {
  const firstRoute = routes[0];
  if (!firstRoute) return;
  const centerLat = Number(firstRoute.latitud) || 8.4273;
  const centerLng = Number(firstRoute.longitud) || -82.4309;
  dashboardMap = L.map("dashboardMap", { zoomControl: true }).setView([centerLat, centerLng], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap",
  }).addTo(dashboardMap);

  if (routePoints.length > 1) {
    const polylineData = routePoints.map((point) => [Number(point.latitud), Number(point.longitud)]);
    L.polyline(polylineData, { color: "#1d61cf", weight: 5 }).addTo(dashboardMap);
  }

  routes.forEach((route) => {
    if (route.latitud && route.longitud) {
      L.marker([Number(route.latitud), Number(route.longitud)]).addTo(dashboardMap).bindPopup(`Ubicación: ${api.sanitizeText(route.nombre_referencia || route.nombre_ruta)}`);
    }
  });

  if (firstRoute.camion_latitud && firstRoute.camion_longitud) {
    L.circleMarker([Number(firstRoute.camion_latitud), Number(firstRoute.camion_longitud)], {
      color: "#b71f1f",
      fillColor: "#ff4d4d",
      fillOpacity: 0.9,
      radius: 8,
    }).addTo(dashboardMap).bindPopup(`Camión ${api.sanitizeText(firstRoute.placa_vehiculo || "")}`);
  }
}

async function renderPerfil() {
  destroyMaps();
  const user = await ensureUser();
  if (!user) return;

  let payload;
  try {
    payload = await api.profile();
  } catch (error) {
    appShell("perfil", `<section class="panel"><h2>Error</h2><p>${api.sanitizeText(error.message)}</p></section>`);
    return;
  }

  const locations = payload.locations || [];
  appShell("perfil", `
    <section class="panel">
      <h1>Perfil del usuario</h1>
      <div data-profile-alert></div>
      <form id="profileForm" class="profile-form">
        <input name="nombre" value="${api.sanitizeText(payload.user.nombre || "")}" placeholder="Nombre" />
        <input name="apellido" value="${api.sanitizeText(payload.user.apellido || "")}" placeholder="Apellido" />
        <input name="telefono" value="${api.sanitizeText(payload.user.telefono || "")}" placeholder="Teléfono" />
        <button class="primary-button" type="submit">Guardar datos</button>
      </form>
    </section>

    <section class="panel">
      <h2>Rutas y ubicaciones activas</h2>
      <div class="location-cards">
        ${locations.map((location) => `
          <article class="location-card">
            <h3>${api.sanitizeText(location.nombre_referencia || "Ubicación")}</h3>
            <p>${api.sanitizeText(location.descripcion_direccion || "-")}</p>
            <p>Ruta: ${api.sanitizeText(location.nombre_ruta || "-")}</p>
            <p>Estado: ${api.sanitizeText(location.estado_suscripcion || "-")} · ${api.sanitizeText(location.estado_pago || "-")}</p>
            <form class="inline-form" data-location-id="${location.ubicacion_id}">
              <input name="nombre_referencia" value="${api.sanitizeText(location.nombre_referencia || "")}" placeholder="Nombre referencia" />
              <textarea name="descripcion_direccion" placeholder="Descripción">${api.sanitizeText(location.descripcion_direccion || "")}</textarea>
              <button class="small-pill" type="submit">Actualizar</button>
            </form>
          </article>
        `).join("") || "<p>No hay ubicaciones registradas.</p>"}
      </div>
    </section>

    <section class="panel">
      <h2>Agregar nueva casa/ruta</h2>
      <div data-location-alert></div>
      <form id="addLocationForm" class="location-form">
        <input name="nombre_referencia" placeholder="Ej: Casa mamá" required />
        <textarea name="descripcion_direccion" placeholder="Descripción dirección" required></textarea>
        <div class="coords">
          <input name="latitud" type="number" step="0.00000001" placeholder="Latitud" required />
          <input name="longitud" type="number" step="0.00000001" placeholder="Longitud" required />
        </div>
        <button class="primary-button" type="submit">Agregar ruta</button>
      </form>
    </section>
  `);

  const profileAlert = app.querySelector("[data-profile-alert]");
  const locationAlert = app.querySelector("[data-location-alert]");
  const profileForm = app.querySelector("#profileForm");
  profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const response = await api.profileUpdate({
        nombre: profileForm.elements.nombre.value.trim(),
        apellido: profileForm.elements.apellido.value.trim(),
        telefono: profileForm.elements.telefono.value.trim(),
      });
      setAlert(profileAlert, response.message, "ok");
      currentUser = null;
    } catch (error) {
      setAlert(profileAlert, error.message, "error");
    }
  });

  app.querySelectorAll(".inline-form").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const locationId = Number(form.getAttribute("data-location-id"));
      try {
        const response = await api.updateLocation(locationId, {
          nombre_referencia: form.elements.nombre_referencia.value.trim(),
          descripcion_direccion: form.elements.descripcion_direccion.value.trim(),
        });
        setAlert(profileAlert, response.message, "ok");
      } catch (error) {
        setAlert(profileAlert, error.message, "error");
      }
    });
  });

  const addLocationForm = app.querySelector("#addLocationForm");
  addLocationForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = addLocationForm.querySelector("button");
    button.disabled = true;
    button.textContent = "Guardando...";
    try {
      const response = await api.createLocation({
        nombre_referencia: addLocationForm.elements.nombre_referencia.value.trim(),
        descripcion_direccion: addLocationForm.elements.descripcion_direccion.value.trim(),
        latitud: Number(addLocationForm.elements.latitud.value),
        longitud: Number(addLocationForm.elements.longitud.value),
      });
      setAlert(locationAlert, response.message, "ok");
      renderPerfil();
    } catch (error) {
      setAlert(locationAlert, error.message, "error");
      button.disabled = false;
      button.textContent = "Agregar ruta";
    }
  });
}

async function renderPagos() {
  destroyMaps();
  const user = await ensureUser();
  if (!user) return;

  let payload;
  try {
    payload = await api.paymentsSummary();
  } catch (error) {
    appShell("pagos", `<section class="panel"><h2>Error</h2><p>${api.sanitizeText(error.message)}</p></section>`);
    return;
  }

  const subscriptions = payload.subscriptions || [];
  const payments = payload.payments || [];
  const summary = payload.summary || {};
  const firstSubscription = subscriptions[0] || null;

  appShell("pagos", `
    <section class="panel">
      <h1>Pagos</h1>
      <div class="pay-cards">
        <article>
          <h3>Próximo pago</h3>
          <strong>${firstSubscription ? money(firstSubscription.monto_mensual) : money(0)}</strong>
          <p>Vence: ${firstSubscription ? formatDate(firstSubscription.proximo_vencimiento) : "-"}</p>
          <span class="badge ${firstSubscription?.estado_pago === "moroso" ? "warn" : "ok"}">${firstSubscription ? mapRouteStatus(firstSubscription.estado_pago) : "Sin suscripción"}</span>
        </article>
        <article>
          <h3>Estado de cuenta</h3>
          <strong>${payload.estado_cuenta === "al_dia" ? "Al día" : "Con saldo pendiente"}</strong>
          <p>Rutas activas: ${summary.rutas_activas || 0}</p>
          <p>Deuda estimada: ${money(summary.deuda_estimada || 0)}</p>
        </article>
      </div>
      <div data-pay-alert></div>
      ${firstSubscription ? `<button class="primary-button" data-pay-now>Pagar ahora</button>` : ""}
    </section>

    <section class="panel">
      <h2>Historial de pagos</h2>
      <div class="payment-list">
        ${payments.map((payment) => `
          <article class="payment-item">
            <div>
              <h3>${api.sanitizeText(payment.nombre_ruta || "Ruta")} · ${api.sanitizeText(payment.periodo_referencia || "")}</h3>
              <p>${formatDate(payment.fecha_pago)} · ${api.sanitizeText(payment.metodo_pago || "Pago web")}</p>
            </div>
            <div>
              <strong>${money(payment.monto)}</strong>
              <span class="badge ok">${api.sanitizeText(payment.estado_pago || "pagado")}</span>
            </div>
          </article>
        `).join("") || "<p>No hay pagos registrados aún.</p>"}
      </div>
    </section>
  `);

  app.querySelector("[data-pay-now]")?.addEventListener("click", async () => {
    const alert = app.querySelector("[data-pay-alert]");
    const button = app.querySelector("[data-pay-now]");
    button.disabled = true;
    button.textContent = "Procesando pago...";
    try {
      const response = await api.paySubscription({
        suscripcion_id: Number(firstSubscription.suscripcion_id),
        metodo_pago: "Pago web",
      });
      setAlert(alert, response.message, "ok");
      renderPagos();
    } catch (error) {
      setAlert(alert, error.message, "error");
      button.disabled = false;
      button.textContent = "Pagar ahora";
    }
  });
}

async function renderNosotros(active = "nosotros") {
  destroyMaps();
  const user = await ensureUser();
  if (!user) return;
  appShell(active, `
    <section class="panel about-hero">
      <div>
        <h1>Quienes somos?</h1>
        <p>SmartSACH es una empresa de servicios ambientales en Chiriquí dedicada a la recolección responsable de residuos sólidos para hogares, comercios y comunidades.</p>
        <p>Nuestro enfoque combina cobertura territorial, puntualidad en rutas y atención al cliente para elevar la calidad del servicio.</p>
        <a class="primary-button" href="${whatsappLink}" target="_blank" rel="noreferrer">Contactar por WhatsApp</a>
      </div>
      <img src="../assets/img/contenido/camion2.jpg" alt="Camión SmartSACH en ruta" />
    </section>

    <section class="panel mission-grid">
      <article>
        <h2>Misión</h2>
        <p>Garantizar un sistema de recolección eficiente, sostenible y cercano a la ciudadanía, con procesos claros y mejora continua.</p>
      </article>
      <article>
        <h2>Visión</h2>
        <p>Ser la empresa líder en gestión de residuos de Chiriquí, reconocida por innovación operativa, transparencia y compromiso ambiental.</p>
      </article>
      <article>
        <h2>Valores</h2>
        <p>Responsabilidad, puntualidad, respeto por el ambiente y servicio humano para cada cliente.</p>
      </article>
    </section>
  `);
}

async function renderAyuda() {
  await renderNosotros("ayuda");
}

async function router() {
  const route = window.location.hash.replace("#", "") || "/login";
  if (route === "/login") renderLogin();
  else if (route === "/registro") renderRegister();
  else if (route === "/public-home") renderPublicHome();
  else if (route === "/dashboard") await renderDashboard();
  else if (route === "/perfil") await renderPerfil();
  else if (route === "/pagos") await renderPagos();
  else if (route === "/nosotros") await renderNosotros("nosotros");
  else if (route === "/ayuda") await renderAyuda();
  else navigate("/login");
}

window.addEventListener("hashchange", router);
api.ensureCsrf().catch(() => null).finally(router);
