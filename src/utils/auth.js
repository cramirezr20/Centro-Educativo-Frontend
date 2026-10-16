import { SESSION_KEY } from "../services/api.js";

function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return {};
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64);
    const bytes = Uint8Array.from(decoded, (character) => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return {};
  }
}

function roleFromClaims(claims) {
  const value =
    claims.rol ||
    claims.role ||
    claims.authorities ||
    claims.roles ||
    claims.authority;
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === "string" ? entry : entry?.authority || entry?.name || ""))
      .filter(Boolean)
      .join(" ");
  }
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    return value.authority || value.name || "";
  }
  return "";
}

export function normalizeRole(role) {
  const normalized = String(role || "").trim().toUpperCase();
  if (normalized.includes("ADMIN")) return "ADMIN";
  if (normalized.includes("DOCENTE")) return "DOCENTE";
  if (normalized.includes("ESTUDIANTE") || normalized.includes("ALUMNO")) {
    return "ESTUDIANTE";
  }
  return "";
}

export function createSession(response, fallbackUsername) {
  const token = String(response?.token || "").trim();
  if (!token) throw new Error("El servidor no devolvió un token de sesión válido.");

  const claims = decodeToken(token);
  const role = normalizeRole(response?.rol || roleFromClaims(claims));
  const username =
    response?.username ||
    claims.username ||
    claims.user_name ||
    claims.sub ||
    fallbackUsername;

  return { token, role, username };
}

export function readSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    return session?.token ? session : null;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function roleLabel(role) {
  return {
    ADMIN: "Administrador",
    DOCENTE: "Docente",
    ESTUDIANTE: "Estudiante",
  }[role] || "Usuario";
}
