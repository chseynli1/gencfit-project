import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import svgr from "vite-plugin-svgr"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    port: 3000,

    proxy: {
      "/api": {
        target: "https://gencfit-backend-3-ird6.onrender.com", // backend portunu yaz
        changeOrigin: true,
        secure: false,
      },
      '/uploads': { target: 'https://gencfit-backend-3-ird6.onrender.com', changeOrigin: true },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
