import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/plugplay/",
  root: ".",
  publicDir: "public",
  server: {
    port: 3000,
    proxy: {
      "/ws": {
        target: "ws://localhost:3001",
        ws: true,
      },
    },
  },
  build: {
    outDir: "dist",
  },
});
