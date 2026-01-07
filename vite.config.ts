import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // المكتبات الرئيسية
          vendor: ["react", "react-dom", "react-router-dom"],
          // Firebase منفصل
          firebase: ["firebase/app", "firebase/firestore", "firebase/auth", "firebase/storage"],
          // Swiper منفصل
          swiper: ["swiper", "swiper/react", "swiper/modules"]
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
});
