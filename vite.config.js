import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/bicep.svg'],
      manifest: {
        name: 'Project Fat Loss',
        short_name: 'Fat Loss',
        description: "Application de suivi d'entraînement avec calcul des calories brûlées",
        theme_color: '#22223b',
        background_color: '#f8f9fa',
        display: 'standalone',
        orientation: 'portrait',
        scope: process.env.NODE_ENV === 'production' ? '/projectfatloss/' : '/',
        start_url: process.env.NODE_ENV === 'production' ? '/projectfatloss/' : '/',
        icons: [
          {
            src: process.env.NODE_ENV === 'production' ? '/projectfatloss/icon-72x72.png' : '/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: process.env.NODE_ENV === 'production' ? '/projectfatloss/icon-96x96.png' : '/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: process.env.NODE_ENV === 'production' ? '/projectfatloss/icon-128x128.png' : '/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: process.env.NODE_ENV === 'production' ? '/projectfatloss/icon-144x144.png' : '/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: process.env.NODE_ENV === 'production' ? '/projectfatloss/icon-152x152.png' : '/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: process.env.NODE_ENV === 'production' ? '/projectfatloss/icon-192x192.png' : '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: process.env.NODE_ENV === 'production' ? '/projectfatloss/icon-384x384.png' : '/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: process.env.NODE_ENV === 'production' ? '/projectfatloss/icon-512x512.png' : '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
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
    })
  ],
  base: process.env.NODE_ENV === 'production' ? '/projectfatloss/' : '/'
});
