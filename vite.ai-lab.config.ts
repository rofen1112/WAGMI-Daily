import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Intentionally independent from the daily admin and publication configuration.
export default defineConfig({
  plugins: [react(), {
    name: 'lab-read-only-public-preview',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/data/main', (request, response, next) => {
        if (request.method !== 'GET' && request.method !== 'HEAD') {
          response.statusCode = 405;
          response.setHeader('Allow', 'GET, HEAD');
          response.end('Read-only public preview');
          return;
        }
        next();
      });
    },
  }],
  server: {
    host: '127.0.0.1',
    port: 5186,
    strictPort: true,
    allowedHosts: ['127.0.0.1', 'localhost'],
    proxy: {
      '/api/ai-lab/v1': { target: 'http://127.0.0.1:8786', changeOrigin: false },
      '/viewer-assets': { target: 'http://127.0.0.1:8786', changeOrigin: false },
      // Development homepage navigation reads only the running site's public JSON.
      // No source data, private admin APIs, or filesystem directories are shared.
      '/data/main': { target: 'http://127.0.0.1:8080', changeOrigin: false },
    },
  },
  build: { outDir: 'dist/ai-lab', emptyOutDir: true },
});
