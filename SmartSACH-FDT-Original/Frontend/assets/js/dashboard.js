// dashboard.js
const token = getToken();

// Redirigir al login si no hay sesión activa
if (!token) {
  window.location.replace("./login.html");
}

// Configurar el botón de cerrar sesión
const logoutBtn = document.querySelector("#logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    clearSession();
    window.location.href = "./login.html";
  });
}

// RUTAS DE PRUEBA (Datos simulados para el servicio en David, Panamá)
const rutasDePrueba = [
  {
    nombre_ruta: "Ruta A-1 Express",
    zona_sector: "San Mateo (David Centro)",
    horario_estimado: "Lunes y Jueves - 7:00 AM"
  },
  {
    nombre_ruta: "Ruta B-3 Residencial",
    zona_sector: "Las Lomas (Sectores 1 y 2)",
    horario_estimado: "Martes y Viernes - 9:30 AM"
  },
  {
    nombre_ruta: "Ruta C-2 Comercial",
    zona_sector: "Barrio Doleguita (Calle Central)",
    horario_estimado: "Miércoles y Sábado - 11:00 AM"
  }
];

// Función para renderizar las rutas en la tabla HTML
function renderRoutes(routes) {
  const table = document.querySelector("#routes-table");
  if (!table) return;

  // Si el backend no devuelve rutas, usamos las rutas de prueba locales
  const rutasAMostrar = routes && routes.length > 0 ? routes : rutasDePrueba;

  table.innerHTML = rutasAMostrar
    .map(
      (route) => `
        <tr>
          <td>${route.nombre_ruta || ""}</td>
          <td>${route.zona_sector || ""}</td>
          <td><span class="badge bg-primary">${route.horario_estimado || ""}</span></td>
        </tr>
      `,
    )
    .join("");
}

// Función para renderizar el estado de cuenta/pago
function renderPaymentStatus(estado) {
  const status = document.querySelector("#payment-status");
  if (!status) return;

  // Forzar un estado "al_dia" de prueba si viene vacío del backend
  const estadoActual = estado || { estado_pago: "al_dia", proximo_vencimiento: "30/06/2026" };

  if (estadoActual.estado_pago === "al_dia") {
    status.innerHTML = `
      <div class="alert alert-success text-center">
        <h3 class="fw-bold mb-1">AL DÍA</h3>
        <small>Próximo vencimiento: ${estadoActual.proximo_vencimiento || "sin fecha"}</small>
      </div>
    `;
    return;
  }

  status.innerHTML = `
    <div class="alert alert-danger text-center">
      <h3 class="fw-bold mb-1">MOROSO</h3>
      <p class="mb-0">Por favor regularice su pago con el recolector SACH.</p>
    </div>
  `;
}

// Función principal para conectar con el backend en Render
async function loadDashboard() {
  try {
    const data = await apiRequest("/api/dashboard");
    
    // Saludo personalizado con el nombre del usuario
    const welcomeEl = document.querySelector("#welcome");
    if (welcomeEl) {
      welcomeEl.textContent = `Hola, ${data.user?.nombre || "Usuario"}`;
    }
    
    // Renderizar (si la API falla o viene vacía, usará el fallback de prueba)
    renderRoutes(data.rutas);
    renderPaymentStatus(data.estado);
    
  } catch (error) {
    console.warn("Fallo al conectar al backend, cargando entorno de prueba offline:", error.message);
    
    // Fallback completo en caso de error de red para que el equipo pueda probar el diseño:
    const welcomeEl = document.querySelector("#welcome");
    if (welcomeEl) {
      const sesionLocal = localStorage.getItem("smartsach_user");
      const usuarioObj = sesionLocal ? JSON.parse(sesionLocal) : null;
      welcomeEl.textContent = `Hola, ${usuarioObj?.nombre || "Integrante del Equipo"}`;
    }
    
    renderRoutes([]);
    renderPaymentStatus(null);
  }
}

// Ejecutar al cargar la página
window.addEventListener("DOMContentLoaded", loadDashboard);