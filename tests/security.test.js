import test from "node:test";
import assert from "node:assert/strict";
import { api, getApiErrorMessage } from "../src/services/api.js";
import { resolveApiUrl } from "../src/services/apiConfig.js";
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
