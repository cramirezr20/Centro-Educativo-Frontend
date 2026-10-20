import axios from "axios";

const DEFAULT_PROD_API_URL = "https://sgau-backend-api-467280352705.us-central1.run.app/api";

export function resolveSecureApiUrl(rawUrl, isDev = false) {
  const candidate = String(
    rawUrl || (isDev ? "/api" : DEFAULT_PROD_API_URL),
  )
    .trim()
    .replace(/\/+$/, "");

  if (candidate.startsWith("/")) {
    return candidate;
  }

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error(`URL de API inválida: "${candidate}".`);
  }

  if (parsed.username || parsed.password) {
    throw new Error("La URL de la API no debe incluir credenciales embebidas.");
  }

  const isLocalhost =
    parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";

  if (parsed.protocol !== "https:" && !(isDev && isLocalhost)) {
    throw new Error(
      `Configuración insegura bloqueada (OWASP): se requiere HTTPS para "${candidate}".`,
    );
  }

  return candidate;
}

const API_URL = resolveSecureApiUrl(
  import.meta.env?.VITE_API_URL,
  Boolean(import.meta.env?.DEV),
);

export const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

export const SESSION_KEY = "centro-educativo-session";

api.interceptors.request.use((config) => {
  let session;
  try {
    session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event("centro-educativo:session-expired"));
  }
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(SESSION_KEY);
      window.dispatchEvent(new Event("centro-educativo:session-expired"));
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error) {
  const data = error.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object") {
    const message = data.message || data.mensaje || data.error;
    if (typeof message === "string" && message.trim()) return message;
  }
  if (error.response) {
    if (error.response.status === 401) return "La sesión expiró. Inicia sesión nuevamente.";
    if (error.response.status === 403) return "No tienes permiso para realizar esta operación.";
    if (error.response.status === 404) return "No se encontró el recurso solicitado.";
    if (error.response.status >= 500) {
      return `El servidor encontró un problema (${error.response.status}).`;
    }
    return `La solicitud fue rechazada (${error.response.status}).`;
  }
  if (error.request) {
    return "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.";
  }
  return error.message || "Ocurrió un error inesperado.";
}
