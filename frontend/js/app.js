const app = document.querySelector("#app");
const api = window.SmartSachAPI;

let currentUser = null;
let leafletMap = null;
let leafletMarker = null;
let routeTimer = null;

const routePoints = [
  [8.4247, -82.4328],
  [8.4259, -82.4312],
  [8.4274, -82.4298],
  [8.4292, -82.4278],
  [8.4314, -82.4265],
  [8.4332, -82.4248],
  [8.4351, -82.4235],
];

function navigate(route) {
  window.location.hash = route;
}

function asset(path) {
  return `../assets/img/${path}`;
}

function brandMark() {
  return `
    <span class="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="50" fill="currentColor" opacity="0.04"></circle>
        <path d="M3 61 C20 47, 33 49, 50 63 C66 76, 82 71, 97 58" fill="none" stroke="currentColor" stroke-width="4"></path>
        <path d="M0 72 C24 58, 34 67, 51 76 C67 84, 79 73, 100 70" fill="none" stroke="currentColor" stroke-width="4"></path>
        <path d="M12 58 C30 30, 51 33, 96 51" fill="none" stroke="currentColor" stroke-width="4"></path>
      </svg>
    </span>
  `;
}

function brandLockup() {
  return `
    <a class="brand-lockup" href="#/home" aria-label="SmartSACH inicio">
      <img class="brand-logo-image" src="${asset("sachlogo.png")}" alt="SmartSACH" />
    </a>
  `;
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

function validateLogin(form) {
  const errors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue(form, "correo"))) errors.correo = "Correo invalido.";
  if (!fieldValue(form, "password")) errors.password = "Ingresa tu contrasena.";
  return errors;
}

function validateRegister(form, location) {
  const errors = {};
  ["nombre", "apellido", "cedula", "correo", "password", "confirmPassword", "direccion", "descripcion"].forEach((name) => {
    if (!fieldValue(form, name)) errors[name] = "Obligatorio.";
  });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue(form, "correo"))) errors.correo = "Correo invalido.";
  if (!/^[A-Z0-9]{1,3}-?\d{1,4}-?\d{1,6}$/i.test(fieldValue(form, "cedula"))) errors.cedula = "Formato invalido.";
  const password = fieldValue(form, "password");
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(password)) errors.password = "Minimo 8, mayuscula, minuscula y numero.";
  if (password !== fieldValue(form, "confirmPassword")) errors.confirmPassword = "No coincide.";
  if (!location.latitud || !location.longitud) errors.ubicacion = "Selecciona la ubicacion.";
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
  cleanupMap();
  app.innerHTML = `
    <section class="auth-shell">
      <div class="login-grid">
        <aside class="welcome-panel">
          <div class="welcome-content">
            ${brandMark()}
            <h2 class="brand-mini">Smartsach</h2>
            <h1 class="welcome-title">Bienvenidos panamenos</h1>
            <p class="welcome-copy">Consulta rutas, avisos y servicios ambientales disponibles en Chiriqui.</p>
            <button class="outline-pill" type="button" data-browse>Navegar</button>
            <nav class="mini-links" aria-label="Enlaces secundarios">
              <a href="#/nosotros">Nosotros</a>
              <span></span>
              <a href="#/home">Home</a>
            </nav>
          </div>
        </aside>
        <section class="form-panel">
          <div class="login-card">
            ${brandLockup()}
            <p class="login-subtitle">Inicie sesion para ser miembro de la plataforma</p>
            <div data-alert></div>
            <form id="loginForm" novalidate>
              <div class="field-stack">
                <label class="field">
                  <span class="sr-only">Correo electronico</span>
                  <input class="input" type="email" name="correo" placeholder="Correo electronico" autocomplete="email" required />
                  <small class="field-error" data-error-for="correo"></small>
                </label>
                <label class="field">
                  <span class="sr-only">Contrasena</span>
                  <input class="input" type="password" name="password" placeholder="Contrasena" autocomplete="current-password" required />
                  <small class="field-error" data-error-for="password"></small>
                </label>
              </div>
              <button class="hint-button" type="button" data-forgot>olvidaste tu contrasena?</button>
              <div><button class="primary-button" type="submit">Ingresar</button></div>
              <p class="switch-line">No tienes cuenta? <button class="link-button" type="button" data-register>Crear cuenta</button></p>
            </form>
          </div>
        </section>
      </div>
    </section>
  `;

  const form = app.querySelector("#loginForm");
  const alert = app.querySelector("[data-alert]");
  app.querySelector("[data-browse]").addEventListener("click", () => {
    currentUser = null;
    navigate("/home");
  });
  app.querySelector("[data-register]").addEventListener("click", () => navigate("/registro"));
  app.querySelector("[data-forgot]").addEventListener("click", async () => {
    const correo = fieldValue(form, "correo");
    if (!correo) return setAlert(alert, "Escribe tu correo para enviarte instrucciones.");
    try {
      const payload = await api.forgotPassword({ correo });
      setAlert(alert, payload.message, "");
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
      const payload = await api.login({ correo: fieldValue(form, "correo"), password: fieldValue(form, "password") });
      currentUser = payload.user;
      navigate("/home");
    } catch (error) {
      showFieldErrors(form, error.errors);
      setAlert(alert, error.message);
    } finally {
      button.disabled = false;
      button.textContent = "Ingresar";
    }
  });
}

function renderRegister() {
  cleanupMap();
  app.innerHTML = `
    <section class="register-page">
      <div class="register-card">
        ${brandLockup()}
        <h1 class="register-title">Creacion de nueva cuenta</h1>
        <div data-alert></div>
        <form id="registerForm" class="register-form" novalidate>
          ${registerField("Nombre", "nombre", "Tu nombre")}
          ${registerField("Apellido", "apellido", "Tu apellido")}
          ${registerField("Cedula", "cedula", "Ej. 4-000-000")}
          ${registerField("Correo electronico", "correo", "correo@ejemplo.com", "email")}
          ${registerField("Contrasena", "password", "Minimo 8 caracteres", "password")}
          ${registerField("Confirmar contrasena", "confirmPassword", "Repite tu contrasena", "password")}
          <h2 class="route-title">RUTA</h2>
          <div class="location-tools">
            <label for="direccion">Ubicacion</label>
            <input class="input" id="direccion" name="direccion" placeholder="Busca tu direccion" autocomplete="street-address" required />
            <button class="icon-button" type="button" data-search title="Buscar direccion" aria-label="Buscar direccion">Buscar</button>
          </div>
          <small class="field-error" data-error-for="direccion"></small>
          <small class="field-error" data-error-for="ubicacion"></small>
          <div class="map-wrap"><div id="map"></div></div>
          <div class="location-preview" data-preview>Selecciona un punto en el mapa o usa tu ubicacion actual.</div>
          <button class="secondary-button compact" type="button" data-geolocate>Usar mi ubicacion</button>
          <label class="description-label" for="descripcion">Descripcion</label>
          <textarea class="textarea" id="descripcion" name="descripcion" placeholder="Ej. Casa color blanco, porton negro, frente a la escuela." required></textarea>
          <small class="field-error" data-error-for="descripcion"></small>
          <div><button class="primary-button" type="submit">Crear cuenta</button></div>
        </form>
        <nav class="mini-links dark" aria-label="Enlaces secundarios">
          <a href="#/nosotros">Nosotros</a>
          <span></span>
          <a href="#/login">Ingresar</a>
        </nav>
      </div>
    </section>
  `;

  const location = { latitud: 8.4273, longitud: -82.4309, direccion: "" };
  const form = app.querySelector("#registerForm");
  const alert = app.querySelector("[data-alert]");
  const preview = app.querySelector("[data-preview]");
  setupRegisterMap(location, form, preview);

  app.querySelector("[data-geolocate]").addEventListener("click", () => {
    if (!navigator.geolocation) return setAlert(alert, "Tu navegador no permite geolocalizacion.");
    navigator.geolocation.getCurrentPosition(
      (position) => updateLocation(position.coords.latitude, position.coords.longitude, location, form, preview, true),
      () => setAlert(alert, "No se pudo obtener tu ubicacion.")
    );
  });

  app.querySelector("[data-search]").addEventListener("click", async () => {
    const query = fieldValue(form, "direccion");
    if (!query) return;
    try {
      const result = await searchAddress(query);
      if (!result) return setAlert(alert, "No encontramos esa direccion.");
      await updateLocation(Number(result.lat), Number(result.lon), location, form, preview, false, result.display_name);
    } catch {
      setAlert(alert, "No se pudo buscar la direccion en este momento.");
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
        password: fieldValue(form, "password"),
        confirmPassword: fieldValue(form, "confirmPassword"),
        direccion: fieldValue(form, "direccion"),
        descripcion: fieldValue(form, "descripcion"),
        latitud: location.latitud,
        longitud: location.longitud,
      });
      currentUser = payload.user;
      navigate("/home");
    } catch (error) {
      showFieldErrors(form, error.errors);
      setAlert(alert, error.message);
    } finally {
      button.disabled = false;
      button.textContent = "Crear cuenta";
    }
  });
}

function registerField(label, name, placeholder, type = "text") {
  return `
    <div class="field-row">
      <label for="${name}">${label}</label>
      <div>
        <input class="input" id="${name}" name="${name}" type="${type}" placeholder="${placeholder}" required />
        <small class="field-error" data-error-for="${name}"></small>
      </div>
    </div>
  `;
}

function shell(active, body, isPublic = false) {
  return `
    <section class="wire-shell">
      <header class="wire-topbar">
        <nav class="wire-nav">
          <a class="${active === "home" ? "active" : ""}" href="#/home">Inicio</a>
          <a class="${active === "perfil" ? "active" : ""}" href="${currentUser ? "#/perfil" : "#/registro"}">Perfil</a>
          <a class="${active === "pagos" ? "active" : ""}" href="${currentUser ? "#/pagos" : "#/registro"}">Pagos</a>
          <a class="${active === "nosotros" ? "active" : ""}" href="#/nosotros">Nosotros</a>
          <a class="${active === "ayuda" ? "active" : ""}" href="#/ayuda">Ayuda</a>
        </nav>
        <div class="wire-session">
          ${currentUser ? `<button type="button" data-logout>Salir</button>` : `<a href="#/login">Ingresar</a>`}
        </div>
      </header>
      ${body}
      ${wireFooter()}
    </section>
  `;
}

function wireFooter() {
  return `
    <footer class="wire-footer">
      <div class="footer-brand">
        <span>SACH</span>
        ${brandMark()}
        <small>Servicios Ambientales de Chiriqui</small>
      </div>
      <div class="footer-contact">
        <strong>Contactenos</strong>
        <span>1828-23423</span>
      </div>
      <div class="footer-contact">
        <strong>David centro, frente a hotel levy</strong>
        <span>+507 5533-2344</span>
      </div>
      <div class="footer-contact">
        <strong>Sachchiriqui</strong>
        <span>@sachchiriqui</span>
      </div>
    </footer>
  `;
}

async function renderHome() {
  cleanupMap();
  await hydrateUser(false);
  const isPublic = !currentUser;
  app.innerHTML = shell("home", `
    <main class="wire-page">
      ${isPublic ? publicIntro() : userPanel()}
      <section class="wire-routes">
        <h2>RUTAS</h2>
        <p class="route-zone">David Este</p>
        <div class="routes-canvas">
          ${routeBubble("David, altos de las moras calle #2, casa7", "left")}
          ${routeBubble("David, altos de las moras calle #2, casa7", "right")}
          ${routeBubble("nuevo horizonte al lado de la cancha, casa#7", "center")}
        </div>
        ${currentUser ? `<button class="wire-link-button" type="button" data-edit-routes>Modificar rutas</button>` : `<a class="wire-link-button" href="#/registro">Crear cuenta para modificar rutas</a>`}
      </section>
    </main>
  `, isPublic);
  wireShellActions();
  app.querySelector("[data-edit-routes]")?.addEventListener("click", () => navigate("/perfil"));
}

function publicIntro() {
  return `
    <section class="wire-user-panel public">
      <div class="public-logo">${brandLockup()}</div>
      <div>
        <h1>Consulta rutas de recoleccion</h1>
        <p>Explora informacion general del servicio, rutas principales y avisos. Crea una cuenta para registrar tu ubicacion, editar rutas y consultar pagos.</p>
        <div class="wire-actions">
          <a class="wire-link-button" href="#/registro">Crear cuenta</a>
          <a class="wire-link-button secondary" href="#/nosotros">Acerca de nosotros</a>
        </div>
      </div>
    </section>
  `;
}

function userPanel() {
  return `
    <h1 class="wire-title">Panel de usuario</h1>
    <section class="wire-user-panel">
      <div class="wire-photo">
        <div class="photo-placeholder">${api.sanitizeText((currentUser.nombre || "U").charAt(0))}</div>
        <button type="button" data-change-photo>Cambiar imagen</button>
      </div>
      <div class="wire-user-data">
        <p><strong>Nombre:</strong><span>${api.sanitizeText(currentUser.nombre || "-")}</span></p>
        <p><strong>Apellido</strong><span>${api.sanitizeText(currentUser.apellido || "-")}</span></p>
        <p><strong>Correo electronico</strong><span>${api.sanitizeText(currentUser.correo_electronico || "-")}</span></p>
      </div>
      <a class="wire-edit-link" href="#/perfil">Modificar datos</a>
    </section>
  `;
}

function routeBubble(text, position) {
  return `
    <article class="route-node ${position}">
      <div class="route-card-wire">${api.sanitizeText(text)}</div>
      <span class="route-icon" aria-hidden="true">
        <span></span><span></span><i></i>
      </span>
      ${position === "center" ? `<small>Algarrobos</small>` : ""}
    </article>
  `;
}

async function renderProfile() {
  cleanupMap();
  if (!(await hydrateUser(true))) return;
  app.innerHTML = shell("perfil", `
    <main class="wire-page">
      <h1 class="wire-title">Perfil</h1>
      <section class="wire-user-panel profile-editor">
        <div class="wire-photo">
          <div class="photo-placeholder">${api.sanitizeText((currentUser.nombre || "U").charAt(0))}</div>
          <button type="button" data-change-photo>Cambiar imagen</button>
        </div>
        <section class="profile-form-panel">
          <h2>Datos de cuenta</h2>
          <div data-alert></div>
          <form id="profileForm">
            <div class="detail-grid">
              <label>Nombre<input class="input left" name="nombre" value="${api.sanitizeText(currentUser.nombre || "")}" /></label>
              <label>Apellido<input class="input left" name="apellido" value="${api.sanitizeText(currentUser.apellido || "")}" /></label>
              <label>Cedula<input class="input left" value="${api.sanitizeText(currentUser.cedula || "")}" disabled /></label>
              <label>Correo<input class="input left" value="${api.sanitizeText(currentUser.correo_electronico || "")}" disabled /></label>
            </div>
            <h2>Ruta asignada</h2>
            <div class="route-card">
              <strong>Ruta David Centro</strong>
              <span>Lunes a sabado - 6:30 PM</span>
              <p>La edicion de rutas queda simulada por ahora. El perfil ya guarda nombre y apellido en Supabase.</p>
              <select class="input left" name="ruta">
                <option>Ruta David Centro</option>
                <option>Ruta Las Lomas</option>
                <option>Ruta San Mateo</option>
              </select>
            </div>
            <button class="primary-button" type="submit">Guardar cambios</button>
          </form>
        </section>
      </section>
    </main>
  `);
  wireShellActions();
  const form = app.querySelector("#profileForm");
  const alert = app.querySelector("[data-alert]");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector("[type='submit']");
    button.disabled = true;
    button.textContent = "Guardando...";
    try {
      const payload = await api.updateProfile({
        nombre: fieldValue(form, "nombre"),
        apellido: fieldValue(form, "apellido"),
      });
      currentUser = payload.user;
      setAlert(alert, payload.message, "");
    } catch (error) {
      setAlert(alert, error.message);
    } finally {
      button.disabled = false;
      button.textContent = "Guardar cambios";
    }
  });
}

async function renderPayments() {
  cleanupMap();
  if (!(await hydrateUser(true))) return;
  app.innerHTML = shell("pagos", `
    <main class="wire-page">
      <h1 class="wire-title">Pagos</h1>
      <section class="payments-wire">
        <article class="pay-summary">
          <span>Estado actual</span>
          <strong data-pay-status>Al dia</strong>
          <p>Suscripcion residencial vinculada a Ruta David Centro.</p>
        </article>
        <article class="pay-summary">
          <span>Monto del mes</span>
          <strong>B/. 12.00</strong>
          <p>Simulacion para validar el flujo del sistema.</p>
        </article>
        <section class="pay-panel">
          <h2>Procesar pago simulado</h2>
          <form class="payment-form">
            <label>Metodo
              <select class="input left">
                <option>Tarjeta terminada en 4242</option>
                <option>Transferencia bancaria</option>
                <option>Efectivo en oficina</option>
              </select>
            </label>
            <label>Referencia
              <input class="input left" value="SIM-${Date.now().toString().slice(-6)}" disabled />
            </label>
            <button class="primary-button" type="button" data-pay>Procesar pago simulado</button>
          </form>
          <div class="timeline" data-timeline>
            <div><strong>Factura emitida</strong><span>Pendiente de confirmacion</span></div>
          </div>
        </section>
      </section>
    </main>
  `);
  wireShellActions();
  app.querySelector("[data-pay]").addEventListener("click", () => {
    app.querySelector("[data-pay-status]").textContent = "Pagado";
    app.querySelector("[data-timeline]").insertAdjacentHTML("afterbegin", `<div><strong>Pago recibido</strong><span>${new Date().toLocaleString("es-PA")}</span></div>`);
  });
}

function renderAbout() {
  cleanupMap();
  app.innerHTML = shell("nosotros", `
    <main class="wire-page">
      <section class="about-page">
        <h1>Acerca de SmartSACH</h1>
        <p>SmartSACH es una plataforma para acercar a la comunidad de Chiriqui a informacion clara sobre recoleccion, rutas, avisos y pagos del servicio ambiental.</p>
        <div class="about-grid">
          <article><strong>Mision</strong><span>Organizar informacion ambiental y mejorar la comunicacion con usuarios.</span></article>
          <article><strong>Rutas</strong><span>Visualizacion de recorridos, horarios y estado del camion.</span></article>
          <article><strong>Usuarios</strong><span>Registro con ubicacion exacta para mejorar la asignacion del servicio.</span></article>
        </div>
      </section>
    </main>
  `, !currentUser);
  wireShellActions();
}

function renderHelp() {
  cleanupMap();
  app.innerHTML = shell("ayuda", `
    <main class="wire-page">
      <section class="about-page">
        <h1>Ayuda</h1>
        <p>Encuentra respuestas rapidas para usar la plataforma y validar el servicio.</p>
        <div class="about-grid">
          <article><strong>Crear cuenta</strong><span>Registra tus datos, selecciona tu ubicacion en el mapa y guarda una descripcion clara.</span></article>
          <article><strong>Rutas</strong><span>Consulta la ruta asignada y solicita modificaciones desde tu perfil.</span></article>
          <article><strong>Pagos</strong><span>El modulo actual simula pagos para pruebas; no procesa dinero real.</span></article>
        </div>
      </section>
    </main>
  `, !currentUser);
  wireShellActions();
}

async function hydrateUser(required) {
  if (currentUser) return true;
  try {
    const payload = await api.me();
    currentUser = payload.user;
    return true;
  } catch {
    currentUser = null;
    if (required) navigate("/login");
    return false;
  }
}

function wireShellActions() {
  app.querySelector("[data-profile]")?.addEventListener("click", () => navigate("/perfil"));
  app.querySelectorAll("[data-change-photo]").forEach((button) => {
    button.addEventListener("click", () => alert("Cambio de imagen simulado. Se puede conectar a carga de archivos cuando se defina almacenamiento."));
  });
  app.querySelector("[data-logout]")?.addEventListener("click", async () => {
    await api.logout().catch(() => null);
    currentUser = null;
    navigate("/login");
  });
}

function setupRegisterMap(location, form, preview) {
  cleanupMap();
  leafletMap = L.map("map", { zoomControl: true }).setView([location.latitud, location.longitud], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap" }).addTo(leafletMap);
  leafletMarker = L.marker([location.latitud, location.longitud], { draggable: true }).addTo(leafletMap);
  leafletMarker.on("dragend", () => {
    const latLng = leafletMarker.getLatLng();
    updateLocation(latLng.lat, latLng.lng, location, form, preview, true);
  });
  leafletMap.on("click", (event) => updateLocation(event.latlng.lat, event.latlng.lng, location, form, preview, true));
  setTimeout(() => leafletMap.invalidateSize(), 200);
  updatePreview(location, form, preview);
}

function setupRouteMap() {
  cleanupMap(false);
  leafletMap = L.map("routeMap", { zoomControl: false }).setView([8.43, -82.428], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap" }).addTo(leafletMap);
  L.polyline(routePoints, { color: "#246248", weight: 5, opacity: 0.85 }).addTo(leafletMap);
  routePoints.forEach((point, index) => {
    if (index === 0 || index === routePoints.length - 1) L.circleMarker(point, { radius: 7, color: "#246248", fillColor: "#ffffff", fillOpacity: 1 }).addTo(leafletMap);
  });
  leafletMarker = L.marker(routePoints[0], { title: "Camion SACH-04" }).addTo(leafletMap);
  let index = 0;
  routeTimer = setInterval(() => {
    index = (index + 1) % routePoints.length;
    leafletMarker.setLatLng(routePoints[index]);
  }, 1300);
  setTimeout(() => leafletMap.invalidateSize(), 200);
}

async function updateLocation(lat, lng, location, form, preview, lookupAddress, knownAddress = "") {
  location.latitud = Number(lat.toFixed(8));
  location.longitud = Number(lng.toFixed(8));
  if (leafletMap && leafletMarker) {
    leafletMap.setView([location.latitud, location.longitud], Math.max(leafletMap.getZoom(), 15));
    leafletMarker.setLatLng([location.latitud, location.longitud]);
  }
  if (knownAddress) {
    location.direccion = knownAddress;
    form.elements.direccion.value = knownAddress.slice(0, 240);
  } else if (lookupAddress) {
    try {
      location.direccion = await reverseGeocode(location.latitud, location.longitud);
      form.elements.direccion.value = location.direccion.slice(0, 240);
    } catch {
      location.direccion = `${location.latitud}, ${location.longitud}`;
    }
  }
  updatePreview(location, form, preview);
}

function updatePreview(location, form, preview) {
  preview.textContent = `${form.elements.direccion.value || "David, Chiriqui, Panama"} - Lat ${location.latitud}, Lng ${location.longitud}`;
}

function cleanupMap(removeMap = true) {
  if (routeTimer) {
    clearInterval(routeTimer);
    routeTimer = null;
  }
  if (removeMap && leafletMap) {
    leafletMap.remove();
    leafletMap = null;
    leafletMarker = null;
  }
}

async function router() {
  const route = window.location.hash.replace("#", "") || "/login";
  if (route === "/login") renderLogin();
  else if (route === "/registro") renderRegister();
  else if (route === "/home" || route === "/dashboard") await renderHome();
  else if (route === "/perfil") await renderProfile();
  else if (route === "/pagos") await renderPayments();
  else if (route === "/nosotros") renderAbout();
  else if (route === "/ayuda") renderHelp();
  else navigate("/login");
}

window.addEventListener("hashchange", router);
api.ensureCsrf().catch(() => null).finally(router);
