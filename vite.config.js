import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { resolveApiUrl } from "./src/services/apiConfig.js";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  if (command === "build") resolveApiUrl(true, env.VITE_API_URL);

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target:
            env.VITE_PROXY_TARGET,
          changeOrigin: true,
          secure: true,
          configure(proxy) {
            proxy.on("proxyReq", (proxyRequest) => {
              proxyRequest.removeHeader("origin");
            });
          },
        },
      },
    },
  };
});
