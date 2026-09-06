import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy API + websocket calls to the Spring Boot backend during development.
      // NOTE: use 127.0.0.1, NOT localhost. On Node 17+ `localhost` can resolve to
      // IPv6 (::1) first, but Spring Boot binds to IPv4 by default — the mismatch
      // surfaces as ECONNREFUSED / "Network Error" in the browser on login while
      // http://localhost:8080 still opens fine directly. 127.0.0.1 forces IPv4.
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/ws': {
        target: process.env.VITE_PROXY_TARGET || 'http://127.0.0.1:8080',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
