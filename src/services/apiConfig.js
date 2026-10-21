export function resolveApiUrl(isProduction, configuredUrl) {
  const url = configuredUrl?.trim() || (isProduction ? "" : "/api");

  if (isProduction) {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      throw new Error("VITE_API_URL debe contener la URL HTTPS de la API de producción.");
    }
    if (parsed.protocol !== "https:" || parsed.username || parsed.password ||
        parsed.search || parsed.hash || !parsed.pathname.replace(/\/+$/, "").endsWith("/api")) {
      throw new Error("VITE_API_URL debe ser una URL HTTPS de la API terminada en /api, sin credenciales ni parámetros.");
    }
  }

  return url.replace(/\/+$/, "");
}
