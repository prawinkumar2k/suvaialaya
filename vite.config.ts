import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  publicDir: "./client/public",
  server: {
    host: "0.0.0.0",
    port: 8080,
    // Origin-Agent-Cluster header removed — caused browser warnings on IP access
    fs: {
      allow: ["./client", "./shared", "index.html"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve",
    async configureServer(server) {
      if (process.env.VITEST) {
        return;
      }

      // ─── CRITICAL: Load .env BEFORE importing Express server ────────────────
      // Vite strips dotenv imports from ES modules. Must be loaded explicitly
      // here so process.env is populated before any server code runs.
      const { config } = await import("dotenv");
      config();

      const { createServer } = await import("./server");
      const app = createServer();

      server.middlewares.use(app);
    },
  };
}

