import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'SenNoflaye — Gestion boutique',
        short_name: 'SenNoflaye',
        description: 'Gestion commerciale simple pour les commerçants sénégalais',
        theme_color: '#101828',
        background_color: '#FAF8F3',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Met en cache les fichiers de l'app (JS/CSS/HTML) pour un chargement
        // instantané et un fonctionnement hors ligne dès la 2e visite.
        // Les données (produits, ventes...) restent gérées par notre propre
        // système offline-first (IndexedDB), pas par le service worker.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
})