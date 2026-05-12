const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    try {
      const payload = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData)),
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
    try {
      const payload = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData)),
      });

      saveSession(payload);
      window.location.href = "./dashboard.html";
    } catch (error) {
      showMessage(error.message);
    }
  });
}
