export const SESSION_KEY = "centro-educativo-session";

function decodeToken(token) {
  try {
    if (typeof token !== "string" || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) return null;
    const [header, payload] = token.split(".");
    const metadata = JSON.parse(atob(header.replace(/-/g, "+").replace(/_/g, "/")));
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64);
    const bytes = Uint8Array.from(decoded, (character) => character.charCodeAt(0));
    const claims = JSON.parse(new TextDecoder().decode(bytes));
    if (!claims || typeof claims !== "object" || Array.isArray(claims)) return null;
    if ("exp" in claims && (typeof claims.exp !== "number" || !Number.isFinite(claims.exp) || claims.exp <= Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
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
  const claims = decodeToken(token);
  if (!claims) throw new Error("El servidor no devolvió un token de sesión válido.");
  const role = normalizeRole(response?.rol || roleFromClaims(claims));
  const username =
    [response?.username, claims.username, claims.user_name, claims.sub, fallbackUsername]
      .find((value) => typeof value === "string" && value.trim()) || "";

  return { token, role, username };
}

export function readSession() {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored === null) return null;
    const session = JSON.parse(stored);
    if (decodeToken(session?.token) && typeof session.role === "string" && typeof session.username === "string") return session;
  } catch {
    // Invalid stored sessions are removed below.
  }
  clearSession();
  return null;
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
