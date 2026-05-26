import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy all /api/* requests to the Express API server
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        // Don't show proxy errors as fatal — gracefully fallback
        configure: (proxy) => {
          proxy.on("error", (err) => {
            // Silently handle connection refused — API server may not be running
            if ((err as any).code !== "ECONNREFUSED") {
              console.error("Proxy error:", err.message);
            }
          });
        },
      },
    },
  },
});
