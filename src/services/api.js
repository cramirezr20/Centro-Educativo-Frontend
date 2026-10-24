import axios from "axios";
import { clearSession, readSession, SESSION_KEY } from "../utils/auth.js";
import { resolveApiUrl } from "./apiConfig.js";

const API_URL = resolveApiUrl(import.meta.env?.PROD, import.meta.env?.VITE_API_URL);

export const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

function normalizePath(value) {
  if (typeof value !== "string" || !value) return "";
  try {
    return new URL(value, "http://localhost").pathname.replace(/\/+$/, "") || "/";
  } catch {
    return value.split("?")[0].replace(/\/+$/, "") || "/";
  }
}

function requestPath(config) {
  const path = normalizePath(config?.url);
  const basePath = normalizePath(config?.baseURL);
  if (basePath && basePath !== "/" && path.startsWith(`${basePath}/`)) {
    return path.slice(basePath.length) || "/";
  }
  return path;
}

export function isPublicAuthRequest(config) {
  const method = String(config?.method || "get").toUpperCase();
  const path = requestPath(config);
  return (method === "GET" && path === "/auth/public-key") ||
    (method === "POST" && path === "/auth/login");
}

function removeAuthorizationHeader(headers) {
  if (!headers) return;
  for (const headerGroup of [headers, headers.common]) {
    if (!headerGroup) continue;
    if (typeof headerGroup.delete === "function") {
      headerGroup.delete("Authorization");
      headerGroup.delete("authorization");
    } else {
      delete headerGroup.Authorization;
      delete headerGroup.authorization;
    }
  }
}

api.interceptors.request.use((config) => {
  if (isPublicAuthRequest(config)) {
    removeAuthorizationHeader(config.headers);
    return config;
  }

  const hadSession = localStorage.getItem(SESSION_KEY) !== null;
  const session = readSession();
  if (hadSession && !session) {
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
    if (error.response?.status === 401 && !isPublicAuthRequest(error.config)) {
      clearSession();
      window.dispatchEvent(new Event("centro-educativo:session-expired"));
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error) {
  if (error.response?.status === 401) return "La sesión expiró. Inicia sesión nuevamente.";
  if (error.response?.status === 403) return "No tienes permiso para realizar esta operación.";
  const safeMessage = (message) =>
    /\bBearer\s+\S+|[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(message)
      ? "La solicitud no pudo completarse."
      : message;
  const data = error.response?.data;
  if (typeof data === "string" && data.trim()) return safeMessage(data);
  if (data && typeof data === "object") {
    const message = data.message || data.mensaje || data.error;
    if (typeof message === "string" && message.trim()) return safeMessage(message);
  }
  if (error.response) {
    if (error.response.status === 404) return "No se encontró el recurso solicitado.";
    if (error.response.status >= 500) {
      return `El servidor encontró un problema (${error.response.status}).`;
    }
    return `La solicitud fue rechazada (${error.response.status}).`;
  }
  if (error.request) {
    return "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.";
  }
  return error.message ? safeMessage(error.message) : "Ocurrió un error inesperado.";
}
