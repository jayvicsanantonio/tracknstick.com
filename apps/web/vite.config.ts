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
const { VITE_API_HOST: DEV_API_HOST } = loadEnv(
  'development',
  __dirname,
  'VITE_',
);
const localApiProxyTarget =
  DEV_API_HOST &&
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(DEV_API_HOST)
    ? DEV_API_HOST
    : 'http://localhost:3000';

export default defineConfig({
  // Allow Cloudflare quick tunnels (`*.trycloudflare.com`) and proxy `/api`
  // to the local API worker so an iPhone over HTTPS can talk to localhost:3000
  // without mixed-content or CORS errors.
  server: {
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      '/api': {
        target: localApiProxyTarget,
        changeOrigin: true,
      },
    },
  },
  preview: {
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      '/api': {
        target: localApiProxyTarget,
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // A new version waits for the user to choose Reload in the update
      // toast (src/main.tsx), so it never reloads the page in the middle of
      // what they are doing.
      registerType: 'prompt',
      includeAssets: ['favicon.ico'],
      // public/manifest.json is the single canonical manifest linked in index.html;
      // disabling injection here avoids shipping a conflicting second manifest.webmanifest.
      manifest: false,
      workbox: {
        // mp3: the habit sounds, so the first one plays at once, and offline.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,mp3}'],
        // iOS fetches its launch images when the app is added to the home
        // screen; precaching them would download every device's to everyone.
        globIgnores: ['**/splash/**'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB limit
        runtimeCaching: [
          ...(VITE_API_HOST
            ? [
                {
                  urlPattern: apiCacheUrlPattern(VITE_API_HOST),
                  handler: 'NetworkFirst' as const,
                  options: {
                    // On a weak signal, the last answer after three seconds
                    // rather than a wait for the network to give up.
                    networkTimeoutSeconds: 3,
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
