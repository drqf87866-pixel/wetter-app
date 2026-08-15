import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/wetter-app/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'Wetter-App',
        short_name: 'Wetter',
        description: 'Wetter-Vorhersage für gespeicherte Orte',
        lang: 'de',
        start_url: '/wetter-app/',
        scope: '/wetter-app/',
        display: 'standalone',
        background_color: '#a86ce8',
        theme_color: '#ff6f91',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
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
