import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Ajouter la base URL pour GitHub Pages
  base: process.env.NODE_ENV === 'production' ? '/projectfatloss/' : '/',
  
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/bicep.svg'],
      manifest: {
        name: 'Project Fatloss',
        short_name: 'Fatloss',
        description: "Application de suivi d'entraînement avec calcul des calories brûlées",
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: process.env.NODE_ENV === 'production' ? '/projectfatloss/' : '/',
        start_url: process.env.NODE_ENV === 'production' ? '/projectfatloss/' : '/',
        icons: [
          {
            src: process.env.NODE_ENV === 'production' ? '/projectfatloss/icons/icon-72x72.png' : '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: process.env.NODE_ENV === 'production' ? '/projectfatloss/icons/icon-96x96.png' : '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: process.env.NODE_ENV === 'production' ? '/projectfatloss/icons/icon-128x128.png' : '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: process.env.NODE_ENV === 'production' ? '/projectfatloss/icons/icon-144x144.png' : '/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: process.env.NODE_ENV === 'production' ? '/projectfatloss/icons/icon-152x152.png' : '/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: process.env.NODE_ENV === 'production' ? '/projectfatloss/icons/icon-192x192.png' : '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: process.env.NODE_ENV === 'production' ? '/projectfatloss/icons/icon-384x384.png' : '/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: process.env.NODE_ENV === 'production' ? '/projectfatloss/icons/icon-512x512.png' : '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/bicep.svg',
            sizes: '96x96',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        // Règles de mise en cache pour workbox
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 an
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 jours
              }
            }
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 semaine
              }
            }
          }
        ]
      }
    }),
  ],
  
  // Optimisations pour éviter les problèmes de cache
  optimizeDeps: {
    force: true // Forcer la réoptimisation à chaque démarrage
  },
  
  // Configurer le serveur de développement
  server: {
    hmr: {
      overlay: true // Afficher les erreurs dans un overlay
    },
    watch: {
      usePolling: true, // Utiliser le polling pour la détection des changements
      interval: 1000 // Intervalle de polling en ms
    }
  },
  
  // Configurer la gestion du cache
  cacheDir: '.vite_cache', // Dossier de cache personnalisé
});
