import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/wetter-app/',
  plugins: [
    react(),
    VitePWA({
      // manifest.webmanifest liegt als statische Datei in public/, und die
      // Service-Worker-Registrierung passiert manuell in main.jsx. Grund:
      // vite-plugin-pwas eingebauter Weg dafür schreibt noch auf die alte
      // Rollup-Art ins Bundle, was unter Vite 8s neuem Rolldown-Bundler
      // bricht (Fehler "assigns to bundle variable" beim Build). Die
      // Service-Worker-Generierung über workbox unten funktioniert
      // unabhängig davon weiterhin normal.
      manifest: false,
      injectRegister: false,
      includeAssets: [
        'favicon.svg',
        'icons.svg',
        'icon-192.png',
        'icon-512.png',
        'icon-512-maskable.png',
        'apple-touch-icon.png',
      ],
      workbox: {
        // App-Shell (HTML/JS/CSS/Icons) fürs Offline-Caching
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        runtimeCaching: [
          {
            // Wetterdaten: erst Netzwerk versuchen, sonst letzten Stand aus dem Cache zeigen
            urlPattern: ({ url }) =>
              url.hostname === 'api.open-meteo.com' ||
              url.hostname === 'geocoding-api.open-meteo.com',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'open-meteo-daten',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60, // 1 Stunde
              },
              networkTimeoutSeconds: 8,
            },
          },
        ],
      },
    }),
  ],
})
