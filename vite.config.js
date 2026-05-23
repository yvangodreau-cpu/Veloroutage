import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'BRouter Mobile',
        short_name: 'BRouter',
        description: 'Planificateur de routes vélo avec BRouter',
        theme_color: '#0ea5e9',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-192-maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: '/screenshot1.png',
            sizes: '540x720',
            type: 'image/png',
            form_factor: 'narrow'
          },
          {
            src: '/screenshot2.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide'
          }
        ],
        categories: ['navigation', 'sports'],
        shortcuts: [
          {
            name: 'Nouvelle route',
            short_name: 'Route',
            description: 'Créer une nouvelle route',
            url: '/?tab=map',
            icons: [
              {
                src: '/icon-96.png',
                sizes: '96x96',
                type: 'image/png'
              }
            ]
          },
          {
            name: 'Configuration',
            short_name: 'Config',
            description: 'Configurer votre vélo',
            url: '/?tab=config',
            icons: [
              {
                src: '/icon-96.png',
                sizes: '96x96',
                type: 'image/png'
              }
            ]
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 jours
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.tile\.thunderforest\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cycle-tiles',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60
              }
            }
          },
          {
            urlPattern: /^https:\/\/brouter\.de\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'brouter-api',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 7 * 24 * 60 * 60 // 7 jours
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    host: '0.0.0.0'
  }
})
