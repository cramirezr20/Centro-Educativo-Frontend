import { api } from "./api.js";

export const LOGIN_CRYPTO_ERROR_CODES = Object.freeze({
  UNAVAILABLE: "LOGIN_CRYPTO_UNAVAILABLE",
  KEY_CONNECTION: "LOGIN_KEY_CONNECTION",
  KEY_REQUEST: "LOGIN_KEY_REQUEST_FAILED",
  KEY_INVALID: "LOGIN_PUBLIC_KEY_INVALID",
  ENCRYPTION_FAILED: "LOGIN_ENCRYPTION_FAILED",
  PASSWORD_INVALID: "LOGIN_PASSWORD_INVALID",
});

export class LoginCryptoError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "LoginCryptoError";
    this.code = code;
  }
}

function getSubtleCrypto() {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.subtle || typeof cryptoApi.subtle.importKey !== "function" ||
      typeof cryptoApi.subtle.encrypt !== "function") {
    throw new LoginCryptoError(
      LOGIN_CRYPTO_ERROR_CODES.UNAVAILABLE,
      "Este navegador no dispone de cifrado seguro para iniciar sesión.",
    );
  }
  return cryptoApi.subtle;
}

function decodeBase64(value) {
  if (typeof value !== "string" || !value || !/^[A-Za-z0-9+/]*={0,2}$/.test(value) ||
      value.length % 4 === 1 || (value.includes("=") && value.length % 4 !== 0)) {
    throw new Error("Base64 inválido");
  }

  const paddedValue = value + "=".repeat((4 - (value.length % 4)) % 4);
  try {
    const binary = atob(paddedValue);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    throw new Error("Base64 inválido");
  }
}

function encodeBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function publicKeyFromResponse(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload) ||
      typeof payload.publicKey !== "string" || !payload.publicKey ||
      payload.algorithm !== "RSA-OAEP" || payload.hash !== "SHA-256" ||
      payload.format !== "SPKI") {
    throw new LoginCryptoError(
      LOGIN_CRYPTO_ERROR_CODES.KEY_INVALID,
      "El servidor devolvió una configuración de cifrado no válida.",
    );
  }

  try {
    return decodeBase64(payload.publicKey);
  } catch {
    throw new LoginCryptoError(
      LOGIN_CRYPTO_ERROR_CODES.KEY_INVALID,
      "El servidor devolvió una clave pública no válida.",
    );
  }
}

async function fetchPublicKey() {
  try {
    const response = await api.get("/auth/public-key");
    return publicKeyFromResponse(response.data);
  } catch (error) {
    if (error instanceof LoginCryptoError) throw error;
    throw new LoginCryptoError(
      error?.response ? LOGIN_CRYPTO_ERROR_CODES.KEY_REQUEST : LOGIN_CRYPTO_ERROR_CODES.KEY_CONNECTION,
      error?.response
        ? "No se pudo obtener la clave pública del servidor."
        : "No se pudo conectar con el servidor para preparar el inicio de sesión.",
    );
  }
}

export async function encryptPassword(password) {
  if (typeof password !== "string" || password.length === 0) {
    throw new LoginCryptoError(
      LOGIN_CRYPTO_ERROR_CODES.PASSWORD_INVALID,
      "La contraseña es obligatoria.",
    );
  }

  const subtle = getSubtleCrypto();
  const publicKeyBytes = await fetchPublicKey();
  let publicKey;

  try {
    publicKey = await subtle.importKey(
      "spki",
      publicKeyBytes,
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"],
    );
  } catch {
    throw new LoginCryptoError(
      LOGIN_CRYPTO_ERROR_CODES.KEY_INVALID,
      "No se pudo importar la clave pública del servidor.",
    );
  }

  try {
    const encodedPassword = new TextEncoder().encode(password);
    const ciphertext = await subtle.encrypt(
      { name: "RSA-OAEP", label: new ArrayBuffer(0) },
      publicKey,
      encodedPassword,
    );
    return encodeBase64(new Uint8Array(ciphertext));
  } catch {
    throw new LoginCryptoError(
      LOGIN_CRYPTO_ERROR_CODES.ENCRYPTION_FAILED,
      "No se pudo cifrar la contraseña de forma segura.",
    );
  }
}
