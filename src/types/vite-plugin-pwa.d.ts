declare module 'vite-plugin-pwa' {
  import type { Plugin } from 'vite';

  export interface VitePWAOptions {
    registerType?: 'autoUpdate' | 'prompt' | 'skipWaiting';
    includeAssets?: string[];
    manifest?: {
      name?: string;
      short_name?: string;
      description?: string;
      theme_color?: string;
      background_color?: string;
      display?: string;
      start_url?: string;
      icons?: {
        src: string;
        sizes: string;
        type: string;
        purpose?: string;
      }[];
      [key: string]: unknown;
    };
    workbox?: {
      globPatterns?: string[];
      navigateFallback?: string;
      navigateFallbackDenylist?: RegExp[];
      runtimeCaching?: {
        urlPattern: RegExp;
        handler: string;
        options?: {
          cacheName?: string;
          expiration?: {
            maxEntries?: number;
            maxAgeSeconds?: number;
          };
          cacheableResponse?: {
            statuses: number[];
          };
        };
      }[];
      offlinePage?: string;
    };
  }

  export function VitePWA(options?: VitePWAOptions): Plugin;
}
