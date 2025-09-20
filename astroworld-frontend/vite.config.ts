import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Proxy Stellarium i18n requests to avoid CORS issues
      '/api/stellarium-i18n': {
        target: 'https://stellarium.sfo2.cdn.digitaloceanspaces.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/stellarium-i18n/, '/i18n/v1'),
      }
    }
  }
})
