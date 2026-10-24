import { webcrypto } from "node:crypto";
import test from "node:test";
import assert from "node:assert/strict";
import { api, getApiErrorMessage, isPublicAuthRequest } from "../src/services/api.js";
import { resolveApiUrl } from "../src/services/apiConfig.js";
import { login } from "../src/services/educationService.js";
import { clearSession, createSession, readSession, saveSession, SESSION_KEY } from "../src/utils/auth.js";

const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: (key) => values.delete(key),
};
globalThis.window = new EventTarget();

function token(claims) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(claims)}.signature`;
}

test("valid token restores session without storing credentials", () => {
  const jwt = token({ sub: "ana", exp: Math.floor(Date.now() / 1000) + 3600 });
  const session = createSession({ token: jwt, rol: "ADMIN", password: "private-password" }, "ana");
  saveSession(session);
  assert.equal(readSession().username, "ana");
  assert.equal(localStorage.getItem(SESSION_KEY).includes("private-password"), false);
  clearSession();
  assert.equal(readSession(), null);
});

test("expired and malformed tokens are removed", () => {
  for (const jwt of [token({ exp: Math.floor(Date.now() / 1000) - 1 }), "broken.jwt", token({ exp: "tomorrow" })]) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token: jwt, role: "ADMIN", username: "ana" }));
    assert.equal(readSession(), null);
    assert.equal(localStorage.getItem(SESSION_KEY), null);
    assert.throws(() => createSession({ token: jwt }, "ana"), /token de sesión válido/);
  }
  localStorage.setItem(SESSION_KEY, "{invalid json");
  assert.equal(readSession(), null);
  assert.equal(localStorage.getItem(SESSION_KEY), null);
});

test("expired token is not sent, and HTTP 401 clears the session", async () => {
  let expiredEvents = 0;
  window.addEventListener("centro-educativo:session-expired", () => expiredEvents++);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ token: token({ exp: 1 }), role: "ADMIN", username: "ana" }));
  await api.get("/test", { adapter: async (config) => {
    assert.equal(config.headers.Authorization, undefined);
    return { data: {}, status: 200, statusText: "OK", headers: {}, config };
  } });
  assert.equal(expiredEvents, 1);
  assert.equal(readSession(), null);

  saveSession(createSession({ token: token({ exp: Math.floor(Date.now() / 1000) + 3600 }) }, "ana"));
  await assert.rejects(api.get("/test", { adapter: async (config) => {
    assert.match(config.headers.Authorization, /^Bearer /);
    throw { response: { status: 401, data: { message: "secret-token" } }, config };
  } }));
  assert.equal(readSession(), null);
  assert.equal(expiredEvents, 2);
  assert.equal(getApiErrorMessage({ response: { status: 401, data: "secret-token" } }).includes("secret-token"), false);
  assert.equal(getApiErrorMessage({ response: { status: 403, data: "secret-token" } }).includes("secret-token"), false);
  const jwt = token({ exp: Math.floor(Date.now() / 1000) + 3600 });
  assert.equal(getApiErrorMessage({ response: { status: 400, data: { message: `Bearer ${jwt}` } } }).includes(jwt), false);
  assert.equal(getApiErrorMessage({ response: { status: 400, data: { message: "Dato inválido" } } }), "Dato inválido");

  saveSession(createSession({ token: token({ exp: Math.floor(Date.now() / 1000) + 3600 }) }, "ana"));
  await assert.rejects(api.get("/test", { adapter: async (config) => {
    throw { response: { status: 403 }, config };
  } }));
  assert.equal(readSession().username, "ana");
  clearSession();
});

test("development uses the local proxy; production requires a HTTPS API URL", () => {
  assert.equal(resolveApiUrl(false), "/api");
  assert.equal(resolveApiUrl(false, "/api/"), "/api");
  assert.equal(resolveApiUrl(true, "https://example.run.app/api/"), "https://example.run.app/api");
  for (const url of [undefined, "/api", "http://example.run.app/api", "https://user:pass@example.run.app/api", "https://example.run.app/other"]) {
    assert.throws(() => resolveApiUrl(true, url), /VITE_API_URL/);
  }
});

test("login imports SPKI and sends only the RSA-OAEP ciphertext", async () => {
  const keyPair = await webcrypto.subtle.generateKey(
    { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["encrypt", "decrypt"],
  );
  const spki = new Uint8Array(await webcrypto.subtle.exportKey("spki", keyPair.publicKey));
  const publicKey = Buffer.from(spki).toString("base64");
  const requests = [];
  const previousAdapter = api.defaults.adapter;
  const previousDefaultAuthorization = api.defaults.headers.common.Authorization;
  const previousCryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto");
  const responseData = { token: "server-response", rol: "ADMIN" };

  Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true, enumerable: true });
  api.defaults.headers.common.Authorization = "Bearer stale-token";
  api.defaults.adapter = async (config) => {
    requests.push({ method: config.method, url: config.url, authorization: config.headers.Authorization, data: config.data });
    if (config.url === "/auth/public-key") {
      return { data: { publicKey, algorithm: "RSA-OAEP", hash: "SHA-256", format: "SPKI" }, status: 200, statusText: "OK", headers: {}, config };
    }
    if (config.url === "/auth/login") {
      return { data: responseData, status: 200, statusText: "OK", headers: {}, config };
    }
    throw new Error(`Unexpected URL: ${config.url}`);
  };

  try {
    const password = "  contraseña ñ  ";
    const response = await login({ username: "ana", password });
    const payload = JSON.parse(requests[1].data);
    const decrypted = await webcrypto.subtle.decrypt(
      { name: "RSA-OAEP", label: new ArrayBuffer(0) },
      keyPair.privateKey,
      Buffer.from(payload.passwordEncrypted, "base64"),
    );

    assert.deepEqual(response, responseData);
    assert.deepEqual(Object.keys(payload).sort(), ["passwordEncrypted", "username"]);
    assert.equal(payload.username, "ana");
    assert.equal(new TextDecoder().decode(decrypted), password);
    assert.deepEqual(requests.map(({ method, url }) => `${method.toUpperCase()} ${url}`), [
      "GET /auth/public-key",
      "POST /auth/login",
    ]);
    assert.equal(requests[0].authorization, undefined);
    assert.equal(requests[1].authorization, undefined);
    assert.equal(isPublicAuthRequest({ method: "GET", url: "/auth/public-key", baseURL: "http://localhost:8081/api" }), true);
    assert.equal(isPublicAuthRequest({ method: "POST", url: "/api/auth/login", baseURL: "http://localhost:8081/api" }), true);
    assert.equal(isPublicAuthRequest({ method: "GET", url: "/auth/login", baseURL: "http://localhost:8081/api" }), false);
  } finally {
    api.defaults.adapter = previousAdapter;
    if (previousDefaultAuthorization === undefined) delete api.defaults.headers.common.Authorization;
    else api.defaults.headers.common.Authorization = previousDefaultAuthorization;
    Object.defineProperty(globalThis, "crypto", previousCryptoDescriptor);
  }
});

test("key retrieval or encryption failure does not issue the login POST", async () => {
  const previousAdapter = api.defaults.adapter;
  const requests = [];
  api.defaults.adapter = async (config) => {
    requests.push(config.method.toUpperCase() + " " + config.url);
    if (config.url === "/auth/public-key") throw new Error("offline");
    throw new Error("The login POST must not run");
  };

  try {
    await assert.rejects(
      login({ username: "ana", password: "secret" }),
      (error) => error.code === "LOGIN_KEY_CONNECTION",
    );
    assert.deepEqual(requests, ["GET /auth/public-key"]);
  } finally {
    api.defaults.adapter = previousAdapter;
  }
});

test("encryption failure does not issue the login POST", async () => {
  const keyPair = await webcrypto.subtle.generateKey(
    { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["encrypt", "decrypt"],
  );
  const spki = new Uint8Array(await webcrypto.subtle.exportKey("spki", keyPair.publicKey));
  const publicKey = Buffer.from(spki).toString("base64");
  const previousAdapter = api.defaults.adapter;
  const previousCryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto");
  const requests = [];
  const failingCrypto = {
    subtle: {
      importKey: (...args) => webcrypto.subtle.importKey(...args),
      encrypt: async () => { throw new Error("cipher failure"); },
    },
  };

  Object.defineProperty(globalThis, "crypto", { value: failingCrypto, configurable: true, enumerable: true });
  api.defaults.adapter = async (config) => {
    requests.push(config.method.toUpperCase() + " " + config.url);
    if (config.url === "/auth/public-key") {
      return { data: { publicKey, algorithm: "RSA-OAEP", hash: "SHA-256", format: "SPKI" }, status: 200, statusText: "OK", headers: {}, config };
    }
    throw new Error("The login POST must not run");
  };

  try {
    await assert.rejects(
      login({ username: "ana", password: "secret" }),
      (error) => error.code === "LOGIN_ENCRYPTION_FAILED",
    );
    assert.deepEqual(requests, ["GET /auth/public-key"]);
  } finally {
    api.defaults.adapter = previousAdapter;
    Object.defineProperty(globalThis, "crypto", previousCryptoDescriptor);
  }
});
