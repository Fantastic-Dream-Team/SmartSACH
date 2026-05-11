const app = document.querySelector("#app");
const api = window.SmartSachAPI;

let currentUser = null;
let leafletMap = null;
let leafletMarker = null;

const brandMark = (className = "") => `
  <span class="brand-mark ${className}" aria-hidden="true">
    <svg viewBox="0 0 100 100" role="img">
      <circle cx="50" cy="50" r="50" fill="currentColor" opacity="0.04"></circle>
      <path d="M3 61 C20 47, 33 49, 50 63 C66 76, 82 71, 97 58" fill="none" stroke="currentColor" stroke-width="4"></path>
      <path d="M0 72 C24 58, 34 67, 51 76 C67 84, 79 73, 100 70" fill="none" stroke="currentColor" stroke-width="4"></path>
      <path d="M12 58 C30 30, 51 33, 96 51" fill="none" stroke="currentColor" stroke-width="4"></path>
    </svg>
  </span>
`;

const brandLockup = () => `
  <div class="brand-lockup">
    ${brandMark()}
    <span class="brand-word">
      <strong>smartSACH</strong>
      <small>SERVICIOS AMBIENTALES DE CHIRIQUI</small>
    </span>
  </div>
`;

function navigate(route) {
  window.location.hash = route;
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
  const correo = fieldValue(form, "correo");
  const password = fieldValue(form, "password");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) errors.correo = "Correo inválido.";
  if (!password) errors.password = "Ingresa tu contraseña.";
  return errors;
}

function validateRegister(form, location) {
  const errors = {};
  const required = ["nombre", "apellido", "cedula", "correo", "password", "confirmPassword", "direccion", "descripcion"];
  required.forEach((name) => {
    if (!fieldValue(form, name)) errors[name] = "Obligatorio.";
  });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue(form, "correo"))) errors.correo = "Correo inválido.";
  if (!/^[A-Z0-9]{1,3}-?\d{1,4}-?\d{1,6}$/i.test(fieldValue(form, "cedula"))) errors.cedula = "Formato inválido.";
  const password = fieldValue(form, "password");
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(password)) errors.password = "Mínimo 8, mayúscula, minúscula y número.";
  if (password !== fieldValue(form, "confirmPassword")) errors.confirmPassword = "No coincide.";
  if (!location.latitud || !location.longitud) errors.ubicacion = "Selecciona la ubicación.";
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
  destroyMap();
  app.innerHTML = `
    <section class="auth-shell">
      <div class="login-grid">
        <aside class="welcome-panel">
          <div class="welcome-content">
            <!-- Espacio reservado para reemplazar luego por el logo oficial del panel izquierdo. -->
            ${brandMark()}
            <h2 class="brand-mini">Smartsach</h2>
            <h1 class="welcome-title">Bienvenidos panameños</h1>
            <p class="welcome-copy">Nuestra pagina web, donde encontraras informacion valiosa, como agendas y rutas de recolección.</p>
            <button class="outline-pill" type="button" data-focus-login>Ingresar</button>
            <nav class="mini-links" aria-label="Enlaces secundarios">
              <a href="#/nosotros">Nosotros</a>
              <span></span>
              <a href="#/ayuda">Ayuda</a>
            </nav>
          </div>
        </aside>
        <section class="form-panel">
          <div class="login-card">
            ${brandLockup()}
            <p class="login-subtitle">Inicie sesión para ser miembro de la plataforma</p>
            <div data-alert></div>
            <form id="loginForm" novalidate>
              <div class="field-stack">
                <label class="field">
                  <span class="sr-only">Correo electrónico</span>
                  <input class="input" type="email" name="correo" placeholder="Correo electronico" autocomplete="email" required />
                  <small class="field-error" data-error-for="correo"></small>
                </label>
                <label class="field">
                  <span class="sr-only">Contraseña</span>
                  <input class="input" type="password" name="password" placeholder="Contraseña" autocomplete="current-password" required />
                  <small class="field-error" data-error-for="password"></small>
                </label>
              </div>
              <button class="hint-button" type="button" data-forgot>olvidaste tu contraseña?</button>
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
  app.querySelector("[data-focus-login]").addEventListener("click", () => form.elements.correo.focus());
  app.querySelector("[data-forgot]").addEventListener("click", async () => {
    const correo = fieldValue(form, "correo");
    if (!correo) {
      setAlert(alert, "Escribe tu correo para enviarte instrucciones.");
      return;
    }
    try {
      setAlert(alert, "");
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

function renderRegister() {
  app.innerHTML = `
    <section class="register-page">
      <div class="register-card">
        ${brandLockup()}
        <h1 class="register-title">Creacion de nueva cuenta</h1>
        <div data-alert></div>
        <form id="registerForm" class="register-form" novalidate>
          ${registerField("Nombre", "nombre", "Fabian")}
          ${registerField("Apellido", "apellido", "Arauz")}
          ${registerField("Cédula", "cedula", "4-826-1202")}
          ${registerField("Correo electronico", "correo", "Arauz@gmail.com", "email")}
          ${registerField("Contraseña", "password", "contraseña123", "password")}
          ${registerField("Confirmar contraseña", "confirmPassword", "Contraseña123", "password")}
          <h2 class="route-title">RUTA</h2>
          <div class="location-tools">
            <label for="direccion">Ubicación</label>
            <input class="input" id="direccion" name="direccion" placeholder="David, chiriqui, panamá" autocomplete="street-address" required />
            <button class="icon-button" type="button" data-search title="Buscar dirección" aria-label="Buscar dirección">⌕</button>
          </div>
          <small class="field-error" data-error-for="direccion"></small>
          <small class="field-error" data-error-for="ubicacion"></small>
          <div class="map-wrap"><div id="map"></div></div>
          <div class="location-preview" data-preview>Selecciona un punto en el mapa o usa tu ubicación actual.</div>
          <button class="icon-button" type="button" data-geolocate title="Usar mi ubicación" aria-label="Usar mi ubicación">⌖</button>
          <label class="description-label" for="descripcion">▮⌖ Descripción</label>
          <textarea class="textarea" id="descripcion" name="descripcion" placeholder="Descripcion de ubicacion exacta" required></textarea>
          <small class="field-error" data-error-for="descripcion"></small>
          <div><button class="primary-button" type="submit">Crear cuenta</button></div>
        </form>
        <nav class="mini-links" aria-label="Enlaces secundarios">
          <a href="#/nosotros">Nosotros</a>
          <span></span>
          <a href="#/ayuda">Ayuda</a>
        </nav>
      </div>
    </section>
  `;

  const location = { latitud: 8.4273, longitud: -82.4309, direccion: "" };
  const form = app.querySelector("#registerForm");
  const alert = app.querySelector("[data-alert]");
  const preview = app.querySelector("[data-preview]");

  setupMap(location, form, preview);

  app.querySelector("[data-geolocate]").addEventListener("click", () => {
    if (!navigator.geolocation) {
      setAlert(alert, "Tu navegador no permite geolocalización.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => updateLocation(position.coords.latitude, position.coords.longitude, location, form, preview, true),
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
      await updateLocation(Number(result.lat), Number(result.lon), location, form, preview, false, result.display_name);
    } catch {
      setAlert(alert, "No se pudo buscar la dirección en este momento.");
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

function setupMap(location, form, preview) {
  destroyMap();
  leafletMap = L.map("map", { zoomControl: true }).setView([location.latitud, location.longitud], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap",
  }).addTo(leafletMap);
  leafletMarker = L.marker([location.latitud, location.longitud], { draggable: true }).addTo(leafletMap);
  leafletMarker.on("dragend", () => {
    const latLng = leafletMarker.getLatLng();
    updateLocation(latLng.lat, latLng.lng, location, form, preview, true);
  });
  leafletMap.on("click", (event) => updateLocation(event.latlng.lat, event.latlng.lng, location, form, preview, true));
  setTimeout(() => leafletMap.invalidateSize(), 200);
  updatePreview(location, form, preview);
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
    form.elements.direccion.value = knownAddress;
  } else if (lookupAddress) {
    try {
      location.direccion = await reverseGeocode(location.latitud, location.longitud);
      form.elements.direccion.value = location.direccion;
    } catch {
      location.direccion = `${location.latitud}, ${location.longitud}`;
    }
  }
  updatePreview(location, form, preview);
}

function updatePreview(location, form, preview) {
  preview.textContent = `${form.elements.direccion.value || "David, Chiriquí, Panamá"} · Lat ${location.latitud}, Lng ${location.longitud}`;
}

function destroyMap() {
  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
    leafletMarker = null;
  }
}

async function renderDashboard() {
  destroyMap();
  try {
    if (!currentUser) {
      const payload = await api.me();
      currentUser = payload.user;
    }
  } catch {
    navigate("/login");
    return;
  }

  app.innerHTML = `
    <section class="dashboard">
      <header>
        ${brandLockup()}
        <button class="primary-button" type="button" data-logout>Salir</button>
      </header>
      <div class="dashboard-content">
        <h1>Hola, ${api.sanitizeText(currentUser.nombre)}.</h1>
        <div class="summary-grid">
          <article class="summary-card"><span>Estado</span><strong>${api.sanitizeText(currentUser.estado_verificacion || "pendiente")}</strong></article>
          <article class="summary-card"><span>Cédula</span><strong>${api.sanitizeText(currentUser.cedula || "-")}</strong></article>
          <article class="summary-card"><span>Correo</span><strong style="font-size:1rem">${api.sanitizeText(currentUser.correo_electronico || "-")}</strong></article>
        </div>
        <section class="data-panel">
          <h2>Paz y salvo</h2>
          <div data-table>Cargando información...</div>
        </section>
      </div>
    </section>
  `;

  app.querySelector("[data-logout]").addEventListener("click", async () => {
    await api.logout().catch(() => null);
    currentUser = null;
    navigate("/login");
  });

  try {
    const payload = await api.pazYSalvo();
    app.querySelector("[data-table]").innerHTML = renderPazYSalvoTable(payload.data);
  } catch (error) {
    app.querySelector("[data-table]").textContent = error.message;
  }
}

function renderPazYSalvoTable(rows = []) {
  if (!rows.length) return "No hay registros de paz y salvo disponibles todavía.";
  return `
    <table>
      <thead><tr><th>Cédula</th><th>Cliente</th><th>Vencimiento</th><th>Estado</th></tr></thead>
      <tbody>
        ${rows.map((row) => `
          <tr>
            <td>${api.sanitizeText(row.cedula)}</td>
            <td>${api.sanitizeText(row.cliente)}</td>
            <td>${api.sanitizeText(row.proximo_vencimiento)}</td>
            <td>${api.sanitizeText(row.estado_financiero)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderInfoPage(title) {
  destroyMap();
  app.innerHTML = `
    <section class="dashboard">
      <header>${brandLockup()}<button class="primary-button" type="button" data-login>Ingresar</button></header>
      <div class="dashboard-content">
        <section class="data-panel">
          <h1>${title}</h1>
          <p>SmartSACH conecta a los usuarios con rutas, pagos y avisos del servicio de recolección.</p>
        </section>
      </div>
    </section>
  `;
  app.querySelector("[data-login]").addEventListener("click", () => navigate("/login"));
}

async function router() {
  const route = window.location.hash.replace("#", "") || "/login";
  if (route === "/login") renderLogin();
  else if (route === "/registro") renderRegister();
  else if (route === "/dashboard") await renderDashboard();
  else if (route === "/nosotros") renderInfoPage("Nosotros");
  else if (route === "/ayuda") renderInfoPage("Ayuda");
  else navigate("/login");
}

window.addEventListener("hashchange", router);
api.ensureCsrf().catch(() => null).finally(router);
