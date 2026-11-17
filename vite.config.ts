import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [react(), {
    name: 'development-entries',
    transformIndexHtml() {
      return [
        {tag:'link', attrs:{rel:'manifest', href:'./manifest.webmanifest'}, injectTo:'head'},
        {tag:'link', attrs:{rel:'icon', href:'./favicon.svg'}, injectTo:'head'},
        {tag:'link', attrs:{rel:'apple-touch-icon', href:'./icon-192.png'}, injectTo:'head'},
      ];
    },
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = new URL(req.url || '/', 'http://localhost');
        if (url.pathname === '/' || url.pathname === '/index.html') req.url = '/guest.html' + url.search;
        if (url.pathname === '/resident.html') req.url = '/city.html' + url.search;
        next();
      });
    },
  }],
  build: {
    assetsDir: 'bundle',
    rollupOptions: { input: ['guest.html', 'city.html'] },
  },
});
