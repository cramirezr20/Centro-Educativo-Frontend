import { useState } from "react";
import logo from "../assets/centro-educativo-logo.svg";
import { getApiErrorMessage } from "../services/api.js";
import { login } from "../services/educationService.js";
import { createSession, saveSession } from "../utils/auth.js";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await login({ username: username.trim(), password });
      const session = createSession(response, username.trim());
      console.log("Sesión recibida:", session);
      saveSession(session);
      onLogin(session);
    } catch (requestError) {
      setError(
        requestError.response?.status === 401
          ? "El usuario o la contraseña no son correctos."
          : getApiErrorMessage(requestError),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-screen">
      <section className="login-visual" aria-label="Centro Educativo">
        <div className="login-visual-content">
          <div className="brand-mark brand-mark-large"><img alt="" src={logo} /></div>
          <p className="eyebrow">PLATAFORMA ACADÉMICA</p>
          <h1>Aprender hoy.<br />Construir el futuro.</h1>
          <p className="login-intro">
            Un espacio para acompañar cada etapa de la vida académica.
          </p>
          <div className="login-visual-footer">
            <span className="decorative-line" />
            <span>Portal del Centro Educativo</span>
          </div>
        </div>
        <div className="visual-orbit orbit-one" />
        <div className="visual-orbit orbit-two" />
      </section>

      <section className="login-panel">
        <div className="login-panel-inner">
          <div className="mobile-brand">
            <div className="brand-mark"><img alt="" src={logo} /></div>
            <span>Centro Educativo</span>
          </div>
          <div className="login-heading">
            <p className="eyebrow">BIENVENIDO/A</p>
            <h2>Inicia sesión</h2>
            <p>Ingresa tus credenciales institucionales para continuar.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Usuario</span>
              <input
                autoComplete="username"
                autoFocus
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Tu usuario"
                required
                value={username}
              />
            </label>
            <label className="field">
              <span>Contraseña</span>
              <input
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Tu contraseña"
                required
                type="password"
                value={password}
              />
            </label>
            {error && <p className="inline-error" role="alert">{error}</p>}
            <button className="button button-primary login-submit" disabled={submitting}>
              {submitting ? "Conectando…" : "Entrar al portal"}
              {!submitting && <span aria-hidden="true">→</span>}
            </button>
          </form>
          <p className="login-security">
            <span aria-hidden="true">▣</span> Tu sesión está protegida por autenticación institucional.
          </p>
        </div>
        <footer className="login-copyright">© Centro Educativo · Portal académico</footer>
      </section>
    </main>
  );
}
