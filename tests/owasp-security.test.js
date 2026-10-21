
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  api,
  getApiErrorMessage,
} from "../src/services/api.js";

import { resolveApiUrl } from "../src/services/apiConfig.js";

import {
  SESSION_KEY,
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

    vars[key] = value.replace(/^["']|["']$/g, "");
  }

  return vars;
}

function createTestJwt(payload) {
  const header = Buffer.from(
      JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");

  const body = Buffer.from(
      JSON.stringify(payload),
  ).toString("base64url");

  return `${header}.${body}.signature`;
}

// ============================================================
// 1. OWASP: CONFIGURACIÓN HTTPS
// ============================================================

test("OWASP: desarrollo utiliza /api y producción exige HTTPS", () => {
  assert.equal(resolveApiUrl(false, undefined), "/api");
  assert.equal(resolveApiUrl(false, "/api/"), "/api");

  assert.equal(
      resolveApiUrl(
          true,
          "https://sgau-backend-api.run.app/api/",
      ),
      "https://sgau-backend-api.run.app/api",
  );

  assert.throws(
      () => resolveApiUrl(true, undefined),
      /VITE_API_URL/i,
  );

  assert.throws(
      () => resolveApiUrl(
          true,
          "http://sgau-backend-api.run.app/api",
      ),
      /HTTPS/i,
  );

  assert.throws(
      () => resolveApiUrl(
          true,
          "https://admin:secreto123@sgau-backend-api.run.app/api",
      ),
      /HTTPS|credenciales/i,
  );

  assert.throws(
      () => resolveApiUrl(
          true,
          "https://sgau-backend-api.run.app/",
      ),
      /\/api/i,
  );

  assert.throws(
      () => resolveApiUrl(
          true,
          "https://sgau-backend-api.run.app/api?token=123",
      ),
      /HTTPS|parámetros/i,
  );
});

test("OWASP: proxy HTTPS y directiva CSP", () => {
  const viteConfig = fs.readFileSync(
      path.join(projectRoot, "vite.config.js"),
      "utf8",
  );

  assert.match(
      viteConfig,
      /secure:\s*true/,
      "El proxy debe verificar certificados HTTPS",
  );

  const indexHtml = fs.readFileSync(
      path.join(projectRoot, "index.html"),
      "utf8",
  );

  assert.match(
      indexHtml,
      /upgrade-insecure-requests/i,
      "Debe existir la directiva CSP upgrade-insecure-requests",
  );
});

// ============================================================
// 2. OWASP: VARIABLES PÚBLICAS Y SECRETOS
// ============================================================

test("OWASP: no exponer secretos en variables VITE_", () => {
  const gitignore = fs.readFileSync(
      path.join(projectRoot, ".gitignore"),
      "utf8",
  );

  assert.match(
      gitignore,
      /^\.env$/m,
      ".env debe estar excluido de Git",
  );

  const trackedEnv = execFileSync(
      "git",
      ["ls-files", ".env"],
      {
        cwd: projectRoot,
        encoding: "utf8",
      },
  ).trim();

  assert.equal(
      trackedEnv,
      "",
      ".env no debe estar versionado",
  );

  const forbiddenKeyPattern =
      /(SECRET|PASSWORD|PASSWD|PRIVATE|API_KEY|APIKEY|TOKEN|CREDENTIAL|DB_)/i;

  const jwtPattern =
      /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

  for (const envFileName of [".env.example", ".env"]) {
    const envPath = path.join(projectRoot, envFileName);

    if (!fs.existsSync(envPath)) continue;

    const envVars = parseEnvFile(envPath);

    for (const [key, value] of Object.entries(envVars)) {
      if (key.startsWith("VITE_")) {
        assert.doesNotMatch(
            key,
            forbiddenKeyPattern,
            `${key} parece contener un secreto`,
        );

        assert.doesNotMatch(
            value,
            jwtPattern,
            `${key} contiene un JWT`,
        );
      }

      if (/^https?:\/\//i.test(value)) {
        assert.match(
            value,
            /^https:\/\//i,
            `${key} debe utilizar HTTPS`,
        );
      }
    }
  }
});

// ============================================================
// 3. OWASP: DEPENDENCIAS
// ============================================================

test("OWASP: npm audit sin vulnerabilidades conocidas", () => {
  const npmCli = process.env.npm_execpath;

  assert.ok(
      npmCli && fs.existsSync(npmCli),
      "No se encontró npm CLI. Ejecuta esta prueba con npm test o npm run test:security.",
  );

  let output;

  try {
    output = execFileSync(
        process.execPath,
        [npmCli, "audit", "--json"],
        {
          cwd: projectRoot,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        },
    );
  } catch (error) {
    output = error.stdout?.toString();

    assert.ok(
        output?.trim(),
        `No se pudo ejecutar npm audit: ${error.message}`,
    );
  }

  const report = JSON.parse(output);

  assert.ok(
      report.metadata?.vulnerabilities &&
      Number.isInteger(report.metadata.vulnerabilities.total),
      "npm audit no devolvió un reporte válido de vulnerabilidades",
  );

  assert.equal(
      report.metadata.vulnerabilities.total,
      0,
      `Se detectaron vulnerabilidades: ${JSON.stringify(report.metadata.vulnerabilities)}`,
  );
});

// ============================================================
// 4. CONFIGURACIÓN DE PRODUCCIÓN
// ============================================================

test("Producción: URL HTTPS explícita; desarrollo: proxy /api", () => {
  const productionUrl =
      "https://sgau-backend-api.run.app/api";

  assert.equal(
      resolveApiUrl(true, productionUrl),
      productionUrl,
  );

  assert.equal(
      resolveApiUrl(false, undefined),
      "/api",
  );

  assert.throws(
      () => resolveApiUrl(true, ""),
      /VITE_API_URL/i,
  );

  assert.equal(
      api.defaults.baseURL,
      "/api",
      "En el entorno de pruebas Node, Axios utiliza /api",
  );
});

// ============================================================
// 5. SESIÓN VENCIDA Y ERRORES 401
// ============================================================

test("Autenticación: HTTP 401 limpia sesión y notifica", async () => {
  setupBrowserMocks();

  const token = createTestJwt({
    sub: "admin",
    rol: "ROLE_ADMIN",
    exp: Math.floor(Date.now() / 1000) + 3600,
  });

  saveSession({
    token,
    role: "ADMIN",
    username: "admin",
  });

  assert.equal(readSession()?.token, token);

  let expiredEventCount = 0;

  window.addEventListener(
      "centro-educativo:session-expired",
      () => {
        expiredEventCount += 1;
      },
  );

  const responseInterceptor =
      api.interceptors.response.handlers[0];

  await assert.rejects(
      async () =>
          responseInterceptor.rejected({
            response: {
              status: 401,
              data: { message: "Token expirado" },
            },
          }),
      (error) => error.response?.status === 401,
  );

  assert.equal(readSession(), null);
  assert.equal(expiredEventCount, 1);

  clearSession();
});

test("Autenticación: sesión corrupta no envía token", () => {
  setupBrowserMocks();

  localStorage.setItem(
      SESSION_KEY,
      "{json-corrupto",
  );

  let expiredEventCount = 0;

  window.addEventListener(
      "centro-educativo:session-expired",
      () => {
        expiredEventCount += 1;
      },
  );

  const requestInterceptor =
      api.interceptors.request.handlers[0];

  const config = requestInterceptor.fulfilled({
    headers: {},
  });

  assert.equal(
      config.headers.Authorization,
      undefined,
  );

  assert.equal(
      localStorage.getItem(SESSION_KEY),
      null,
  );

  assert.equal(expiredEventCount, 1);
});

// ============================================================
// 6. AUTENTICACIÓN Y MENSAJES SEGUROS
// ============================================================

test("Autenticación: mensajes seguros para 401 y 403", () => {
  assert.equal(
      getApiErrorMessage({
        response: {
          status: 401,
          data: {},
        },
      }),
      "La sesión expiró. Inicia sesión nuevamente.",
  );

  assert.equal(
      getApiErrorMessage({
        response: {
          status: 403,
          data: {},
        },
      }),
      "No tienes permiso para realizar esta operación.",
  );

  assert.equal(
      getApiErrorMessage({
        response: {
          status: 401,
          data: {
            message: "Credenciales inválidas",
          },
        },
      }),
      "La sesión expiró. Inicia sesión nuevamente.",
  );

  assert.equal(
      getApiErrorMessage({
        response: {
          status: 500,
          data: {
            message: "Bearer token.secreto.firma",
          },
        },
      }),
      "La solicitud no pudo completarse.",
  );
});

// ============================================================
// 7. VALIDACIÓN DE JWT
// ============================================================

test("JWT: rechaza token vacío y permite sesión válida", () => {
  assert.throws(
      () => createSession(
          { token: "   " },
          "admin",
      ),
      /token de sesión válido/i,
  );

  const jwt = createTestJwt({
    sub: "docente1",
    rol: "ROLE_DOCENTE",
    exp: Math.floor(Date.now() / 1000) + 3600,
  });

  const session = createSession(
      { token: jwt },
      "fallback",
  );

  assert.deepEqual(session, {
    token: jwt,
    role: "DOCENTE",
    username: "docente1",
  });
});
