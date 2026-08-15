import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Service Worker manuell registrieren (der automatische Weg von
// vite-plugin-pwa ist unter Vite 8 / Rolldown aktuell kaputt, siehe
// vite.config.js). sw.js wird weiterhin vom Plugin korrekt erzeugt.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch(() => {
        // App funktioniert auch ohne Service Worker normal weiter,
        // nur ohne Offline-Caching.
      })
  })
}
