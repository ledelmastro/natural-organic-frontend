import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['maplibre-gl']
  },
  build: {
    rollupOptions: {
      output: {
        // CORREÇÃO: manualChunks agora como função para evitar o TypeError
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('maplibre-gl')) {
              return 'maplibre';
            }
            return 'vendor'; // Agrupa outras bibliotecas em um arquivo separado
          }
        }
      }
    }
  },
  server: {
    proxy: {
      '/carrinho': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/geolocalizacao': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})