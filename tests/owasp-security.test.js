import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  api,
  getApiErrorMessage,
  resolveSecureApiUrl,
  SESSION_KEY,
} from "../src/services/api.js";
import {
  clearSession,
  createSession,
  readSession,
  saveSession,
} from "../src/utils/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function setupBrowserMocks() {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };

  const eventTarget = new EventTarget();
  globalThis.window = {
    addEventListener: eventTarget.addEventListener.bind(eventTarget),
    removeEventListener: eventTarget.removeEventListener.bind(eventTarget),
    dispatchEvent: eventTarget.dispatchEvent.bind(eventTarget),
  };
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf8");
  const vars = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;
    const key = line.slice(0, eqIndex).trim();
    const value = line.slice(eqIndex + 1).trim();
    vars[key] = value;
  }
  return vars;
}

// ============================================================================
// 1. OWASP: CONFIGURACIÓN (HTTPS y ausencia de secretos en variables públicas)
// ============================================================================

test("OWASP Configuración: resolveSecureApiUrl exige HTTPS y bloquea HTTP inseguro", () => {
  assert.equal(resolveSecureApiUrl("/api/", true), "/api");
  assert.equal(
    resolveSecureApiUrl("https://sgau-backend-api.run.app/api/", false),
    "https://sgau-backend-api.run.app/api",
  );

  assert.throws(
    () => resolveSecureApiUrl("http://sgau-backend-api.run.app/api", false),
    /se requiere HTTPS/i,
  );

  assert.throws(
    () => resolveSecureApiUrl("http://sgau-backend-api.run.app/api", true),
    /se requiere HTTPS/i,
  );

  assert.throws(
    () => resolveSecureApiUrl("https://admin:secreto123@sgau-backend-api.run.app/api", false),
    /credenciales embebidas/i,
  );
});

test("OWASP Configuración: vite.config.js e index.html fuerzan transporte seguro HTTPS", () => {
  const viteConfig = fs.readFileSync(path.join(projectRoot, "vite.config.js"), "utf8");
  assert.match(
    viteConfig,
    /secure:\s*true/,
    "El proxy de Vite debe tener 'secure: true' para validar certificados TLS/HTTPS",
  );

  const indexHtml = fs.readFileSync(path.join(projectRoot, "index.html"), "utf8");
  assert.match(
    indexHtml,
    /upgrade-insecure-requests/i,
    "index.html debe incluir la directiva CSP 'upgrade-insecure-requests'",
  );
});

test("OWASP Configuración: ausencia de secretos en variables públicas (VITE_*) y exclusión de .env en Git", () => {
  const gitignore = fs.readFileSync(path.join(projectRoot, ".gitignore"), "utf8");
  assert.match(gitignore, /^\.env$/m, ".gitignore debe ignorar el archivo .env");

  const trackedEnv = execSync("git ls-files .env", {
    cwd: projectRoot,
    encoding: "utf8",
  }).trim();
  assert.equal(trackedEnv, "", "El archivo .env no debe estar versionado en Git");

  const forbiddenKeyPattern = /(SECRET|PASSWORD|PASSWD|PRIVATE|API_KEY|APIKEY|TOKEN|CREDENTIAL|DB_)/i;
  const jwtPattern = /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

  for (const envFileName of [".env.example", ".env"]) {
    const envPath = path.join(projectRoot, envFileName);
    if (!fs.existsSync(envPath)) continue;

    const envVars = parseEnvFile(envPath);
    for (const [key, value] of Object.entries(envVars)) {
      if (key.startsWith("VITE_")) {
        assert.doesNotMatch(
          key,
          forbiddenKeyPattern,
          `La variable pública ${key} en ${envFileName} sugiere contener un secreto`,
        );
        assert.doesNotMatch(
          value,
          jwtPattern,
          `La variable pública ${key} en ${envFileName} contiene un token JWT quemado`,
        );
      }

      if (/^https?:\/\//i.test(value)) {
        assert.match(
          value,
          /^https:\/\//i,
          `La URL configurada en ${key} (${envFileName}) debe usar https://`,
        );
      }
    }
  }
});

// ============================================================================
// 2. OWASP: DEPENDENCIAS (Vulnerabilidades conocidas en paquetes npm)
// ============================================================================

test("OWASP Dependencias: revisar vulnerabilidades conocidas en paquetes npm (npm audit)", () => {
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const auditOutput = execSync(`${npmCmd} audit --json`, {
    cwd: projectRoot,
    encoding: "utf8",
  });

  const report = JSON.parse(auditOutput);
  const vulnerabilities = report.metadata?.vulnerabilities || {};
  const total = vulnerabilities.total ?? 0;

  assert.equal(
    total,
    0,
    `Se detectaron ${total} vulnerabilidades en paquetes npm: ${JSON.stringify(vulnerabilities)}`,
  );
});

// ============================================================================
// 3. PRUEBAS: Configuración de producción, sesión vencida y errores de auth
// ============================================================================

test("Pruebas: verificar configuración de producción (URL válida de Cloud Run) y desarrollo", () => {
  const prodUrl = resolveSecureApiUrl("", false);
  assert.match(
    prodUrl,
    /^https:\/\/[a-z0-9-]+\.[a-z0-9-]+\.run\.app\/api$/i,
    "En producción debe utilizar una URL HTTPS válida de Google Cloud Run (*.run.app/api)",
  );

  const devUrl = resolveSecureApiUrl("", true);
  assert.equal(devUrl, "/api", "En desarrollo debe utilizar el proxy local /api");

  assert.equal(
    api.defaults.baseURL,
    prodUrl,
    "La instancia de Axios debe apuntar por defecto a la URL de producción de Cloud Run",
  );
});

test("Pruebas: verificar manejo de sesión vencida (respuesta 401 y sesión corrupta)", async () => {
  setupBrowserMocks();

  // Caso 1: Sesión activa que vence cuando el servidor responde 401 Unauthorized
  saveSession({ token: "token-activo-123", role: "ADMIN", username: "admin" });
  assert.ok(readSession()?.token, "La sesión debe estar guardada inicialmente");

  let expiredEventCount = 0;
  window.addEventListener("centro-educativo:session-expired", () => {
    expiredEventCount += 1;
  });

  const responseInterceptor = api.interceptors.response.handlers[0];
  await assert.rejects(
    async () =>
      responseInterceptor.rejected({
        response: { status: 401, data: { message: "Token expirado" } },
      }),
    (err) => err.response?.status === 401,
  );

  assert.equal(
    readSession(),
    null,
    "Al recibir 401 (sesión vencida), se debe eliminar la sesión de localStorage",
  );
  assert.equal(
    expiredEventCount,
    1,
    "Al recibir 401, se debe disparar el evento 'centro-educativo:session-expired'",
  );

  // Caso 2: Sesión corrupta en localStorage al interceptar petición
  localStorage.setItem(SESSION_KEY, "{json-corrupto");
  const requestInterceptor = api.interceptors.request.handlers[0];
  const config = requestInterceptor.fulfilled({ headers: {} });

  assert.equal(config.headers.Authorization, undefined);
  assert.equal(localStorage.getItem(SESSION_KEY), null);
  assert.equal(
    expiredEventCount,
    2,
    "Una sesión corrupta debe limpiarse y notificar 'centro-educativo:session-expired'",
  );

  clearSession();
});

test("Pruebas: verificar errores de autenticación (401, 403 y login sin token válido)", () => {
  // Error 401 sin mensaje personalizado del backend
  assert.equal(
    getApiErrorMessage({ response: { status: 401, data: {} } }),
    "La sesión expiró. Inicia sesión nuevamente.",
  );

  // Error 403 (falta de permisos por rol)
  assert.equal(
    getApiErrorMessage({ response: { status: 403, data: {} } }),
    "No tienes permiso para realizar esta operación.",
  );

  // Error de autenticación cuando el backend devuelve mensaje explícito
  assert.equal(
    getApiErrorMessage({
      response: { status: 401, data: { message: "Credenciales inválidas" } },
    }),
    "Credenciales inválidas",
  );

  // Error cuando el login no devuelve un token JWT válido
  assert.throws(
    () => createSession({ token: "   " }, "admin"),
    /no devolvió un token de sesión válido/i,
  );

  // Creación exitosa de sesión con un JWT válido
  const payloadBase64 = Buffer.from(
    JSON.stringify({ sub: "docente1", rol: "ROLE_DOCENTE" }),
  ).toString("base64url");
  const fakeJwt = `eyJhbGciOiJIUzI1NiJ9.${payloadBase64}.signature`;
  const session = createSession({ token: fakeJwt }, "fallback");

  assert.deepEqual(session, {
    token: fakeJwt,
    role: "DOCENTE",
    username: "docente1",
  });
});
