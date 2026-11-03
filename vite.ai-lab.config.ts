import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Intentionally independent from the daily admin and publication configuration.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5186,
    strictPort: true,
    allowedHosts: ['127.0.0.1', 'localhost'],
    proxy: {
      '/api/ai-lab/v1': { target: 'http://127.0.0.1:8786', changeOrigin: false },
      '/viewer-assets': { target: 'http://127.0.0.1:8786', changeOrigin: false },
    },
  },
  build: { outDir: 'dist/ai-lab', emptyOutDir: true },
});
