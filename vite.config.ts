import { resolve } from "node:path";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [basicSsl()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    https: true
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    https: true
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        phoneAr: resolve(__dirname, "phone-ar.html"),
        questAr: resolve(__dirname, "quest-ar.html"),
        immersiveAr: resolve(__dirname, "immersive-ar.html"),
        immersiveArWithMaker: resolve(__dirname, "immersive-ar-with-maker.html")
      }
    }
  }
});
