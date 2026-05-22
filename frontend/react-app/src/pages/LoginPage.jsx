import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertBox } from "../components/common/AlertBox";
import { BrandLockup } from "../components/common/BrandLockup";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/authService";

const BUILD_TAG = "build-2026-05-13-r1";

function validate(form) {
  const errors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) errors.correo = "Correo invalido.";
  if (!form.password) errors.password = "Ingresa tu contraseña.";
  return errors;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ correo: "", password: "" });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ message: "", type: "error" });
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const canSubmit = useMemo(() => form.correo && form.password && !isLoading, [form, isLoading]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const onForgot = async () => {
    if (!form.correo) {
      setAlert({ message: "Escribe tu correo para enviarte instrucciones.", type: "error" });
      return;
    }
    setIsForgotLoading(true);
    setAlert({ message: "", type: "error" });
    try {
      const payload = await authService.forgotPassword({ correo: form.correo.trim() });
      setAlert({ message: payload.message, type: "ok" });
    } catch (error) {
      setAlert({ message: error.message, type: "error" });
    } finally {
      setIsForgotLoading(false);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate({ correo: form.correo.trim(), password: form.password.trim() });
    setErrors(nextErrors);
    setAlert({ message: "", type: "error" });
    if (Object.keys(nextErrors).length) return;

    setIsLoading(true);
    try {
      await login({
        correo: form.correo.trim(),
        password: form.password,
      });
      navigate("/dashboard");
    } catch (error) {
      setErrors(error.errors || {});
      setAlert({ message: error.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="login-grid">
        <aside className="welcome-panel">
          <div className="welcome-content">
            <h2>SmartSACH</h2>
            <h1>Gestion inteligente de recoleccion en Chiriqui</h1>
            <p>Consulta rutas, pagos, reporta incidencias y mantén tu servicio al dia.</p>
            <button className="outline-pill" type="button" onClick={() => navigate("/public-home")}>
              Navegar
            </button>
          </div>
        </aside>

        <section className="form-panel">
          <div className="corner-circle" aria-hidden="true"></div>
          <div className="login-card">
            <BrandLockup />
            <p className="login-subtitle">Inicia sesion para entrar a tu panel</p>
            <AlertBox message={alert.message} type={alert.type} />
            <form onSubmit={onSubmit} noValidate>
              <div className="field-stack">
                <label className="field">
                  <span className="sr-only">Correo electronico</span>
                  <input
                    className="input"
                    type="email"
                    name="correo"
                    value={form.correo}
                    onChange={onChange}
                    placeholder="Correo electronico"
                    autoComplete="email"
                    required
                  />
                  <small className="field-error">{errors.correo || ""}</small>
                </label>
                <label className="field">
                  <span className="sr-only">Contraseña</span>
                  <input
                    className="input"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    placeholder="Contraseña"
                    autoComplete="current-password"
                    required
                  />
                  <small className="field-error">{errors.password || ""}</small>
                </label>
              </div>
              <button className="ghost-btn" type="button" onClick={onForgot} disabled={isForgotLoading}>
                {isForgotLoading ? "Enviando..." : "Olvide mi contraseña"}
              </button>
              <div>
                <button className="primary-button" type="submit" disabled={!canSubmit}>
                  {isLoading ? "Ingresando..." : "Ingresar"}
                </button>
              </div>
              <p className="switch-line">
                No tienes cuenta?{" "}
                <Link className="link-button" to="/registro">
                  Crear cuenta
                </Link>
              </p>
            </form>
            <p className="build-tag">{BUILD_TAG}</p>
          </div>
        </section>
      </div>
    </section>
  );
}
