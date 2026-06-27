// Frontend/assets/js/auth.js
const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData);

    try {
      // Envía POST al backend en Render
      const payload = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          correo: data.correo,
          password: data.password
        }),
      });

      saveSession(payload);
      window.location.href = "./dashboard.html";
    } catch (error) {
      showMessage(error.message);
    }
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(registerForm);
    const data = Object.fromEntries(formData);

    try {
      // Envía POST estructurado con los metadatos requeridos por la base de datos
      const payload = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          correo: data.correo,
          password: data.password,
          nombre: data.nombre,
          apellido: data.apellido,
          cedula: data.cedula
        }),
      });

      saveSession(payload);
      window.location.href = "./dashboard.html";
    } catch (error) {
      showMessage(error.message);
    }
  });
}