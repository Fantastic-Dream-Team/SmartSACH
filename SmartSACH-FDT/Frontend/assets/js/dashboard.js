const token = getToken();

if (!token) {
  window.location.replace("./login.html");
}

document.querySelector("#logout").addEventListener("click", () => {
  clearSession();
  window.location.href = "./login.html";
});

function renderRoutes(routes) {
  const table = document.querySelector("#routes-table");

  if (!routes.length) {
    table.innerHTML = "<tr><td colspan='3' class='text-center'>No tienes rutas asignadas aun.</td></tr>";
    return;
  }

  table.innerHTML = routes
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

function renderPaymentStatus(estado) {
  const status = document.querySelector("#payment-status");

  if (estado?.estado_pago === "al_dia") {
    status.innerHTML = `
      <div class="alert alert-success">
        <h3>AL DIA</h3>
        <small>Vence: ${estado.proximo_vencimiento || "sin fecha"}</small>
      </div>
    `;
    return;
  }

  status.innerHTML = `
    <div class="alert alert-danger">
      <h3>MOROSO</h3>
      <p>Por favor regularice su pago.</p>
    </div>
  `;
}

async function loadDashboard() {
  try {
    const data = await apiRequest("/api/dashboard");
    document.querySelector("#welcome").textContent = `Hola, ${data.user.nombre}`;
    renderRoutes(data.rutas || []);
    renderPaymentStatus(data.estado);
  } catch (error) {
    showMessage(error.message);
  }
}

loadDashboard();
