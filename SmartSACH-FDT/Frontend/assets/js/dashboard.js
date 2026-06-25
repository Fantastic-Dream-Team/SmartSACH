// Asegúrate de que esta sección en tu dashboard.js permanezca igual o similar
async function loadDashboard() {
  try {
    // Ejecuta de manera nativa una petición GET protegida por el middleware de Render
    const data = await apiRequest("/api/dashboard");
    
    document.querySelector("#welcome").textContent = `Hola, ${data.user.nombre} ${data.user.apellido || ''}`;
    renderRoutes(data.rutas || []);
    renderPaymentStatus(data.estado);
  } catch (error) {
    showMessage(error.message);
    // Si el token es inválido o expiró, redirigir a login
    setTimeout(() => { window.location.replace("./login.html"); }, 2000);
  }
}

loadDashboard();