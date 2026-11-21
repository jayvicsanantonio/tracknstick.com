import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import {
  API_CACHE_NAME,
  apiCacheUrlPattern,
} from './src/shared/constants/apiCache';

// The API host this build calls: from the .env files, or from the
// environment, where Cloudflare Pages sets it. The service worker only exists
// in production builds, so the production files are the ones read. Without a
// host there is no API to cache, and the rule below is left out.
const { VITE_API_HOST } = loadEnv('production', __dirname, 'VITE_');

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'offline.html'],
      manifest: {
        name: "Track N' Stick",
        short_name: "Track N' Stick",
        description: "Track N' Stick - Help you track and build healthy habits",
        theme_color: '#4f46e5',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB limit
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          ...(VITE_API_HOST
            ? [
                {
                  urlPattern: apiCacheUrlPattern(VITE_API_HOST),
                  handler: 'NetworkFirst' as const,
                  options: {
                    // Holds signed-in users' responses, keyed by URL alone.
                    // useClearApiCacheOnUserChange empties it when the user
                    // changes.
                    cacheName: API_CACHE_NAME,
                    expiration: {
                      maxEntries: 100,
                      maxAgeSeconds: 60 * 60 * 24, // 24 hours
                    },
                    cacheableResponse: {
                      statuses: [0, 200],
                    },
                  },
                },
              ]
            : []),
        ],
        inlineWorkboxRuntime: true,
      },
      strategies: 'generateSW',
      filename: 'sw.js',
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // react-dom/client is the entry the app imports; without it the
          // chunk came out empty and React DOM stayed in the main bundle.
          vendor: ['react', 'react-dom', 'react-dom/client'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
          ],
          icons: ['lucide-react'],
          clerk: ['@clerk/clerk-react'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app': path.resolve(__dirname, './src/app'),
      '@features': path.resolve(__dirname, './src/features'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@testing': path.resolve(__dirname, './src/testing'),
    },
  },
});
