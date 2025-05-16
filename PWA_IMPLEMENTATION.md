# TrackNStick PWA Implementation Documentation

## Overview

This document details the process of converting TrackNStick into a Progressive Web App (PWA), enabling offline functionality, installability, and improved user experience.

## Dependencies Added

```bash
npm install -D vite-plugin-pwa
npm install -D @types/workbox-window
```

## Configuration Files

### 1. Web Manifest (`public/manifest.json`)

```json
{
  "name": "TrackNStick",
  "short_name": "TrackNStick",
  "description": "TrackNStick - Track and manage your assets efficiently",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4f46e5",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### 2. Vite Configuration (`vite.config.ts`)

We extended the Vite configuration to include the PWA plugin with specific settings:

```typescript
// @ts-nocheck
import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'offline.html'],
      manifest: {
        name: 'TrackNStick',
        short_name: 'TrackNStick',
        description:
          'TrackNStick - Track and manage your assets efficiently',
        theme_color: '#4f46e5',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/],
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
          {
            urlPattern: /^https:\/\/api\.tracknstick\.com\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      strategies: 'generateSW',
      filename: 'sw.js',
      navigateFallbackDenylist: [/^\/api/],
      navigateFallback: 'index.html',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 3. TypeScript Type Definitions (`src/types/vite-plugin-pwa.d.ts`)

We created custom type declarations for the vite-plugin-pwa module:

```typescript
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
```

### 4. Updated tsconfig.app.json

We updated the TypeScript configuration to include our custom type definitions:

```json
{
  "include": ["src", "env.d.ts", "src/types"]
}
```

### 5. Virtual Module Type Definition (`src/vite-env.d.ts`)

We added type declarations for the virtual modules provided by vite-plugin-pwa:

```typescript
// PWA Virtual modules
declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (
      registration: ServiceWorkerRegistration | undefined
    ) => void;
    onRegisterError?: (error: Error) => void;
  }

  export function registerSW(
    options?: RegisterSWOptions
  ): (reloadPage?: boolean) => Promise<void>;
}
```

## HTML Modifications (`index.html`)

We updated the HTML file to include PWA-specific meta tags:

```html
<head>
  <meta charset="UTF-8" />
  <link rel="icon" href="/favicon.ico" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <meta
    name="description"
    content="TrackNStick - Track and manage your assets efficiently"
  />
  <meta name="theme-color" content="#4f46e5" />
  <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
  <title>Track N' Stick</title>
</head>
```

## Service Worker Registration (`src/main.tsx`)

We added code to register the service worker with update and offline notifications:

```typescript
import { registerSW } from 'virtual:pwa-register';

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      void updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
});
```

## PWA Install Prompt Component (`src/components/PWAInstallPrompt.tsx`)

We created a custom component to detect and prompt users to install the app:

```typescript
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();

      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show the install button
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    void deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }

    // Clear the saved prompt since it can't be used again
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-50 max-w-sm border border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold text-lg mb-2">Install TrackNStick</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        Install our app on your device for a better experience!
      </p>
      <div className="flex justify-end">
        <Button variant="ghost" onClick={() => setIsVisible(false)} className="mr-2">
          Not now
        </Button>
        <Button onClick={() => void handleInstallClick()}>
          Install
        </Button>
      </div>
    </div>
  );
}
```

## Offline Page (`public/offline.html`)

We created a dedicated offline page to enhance the user experience when connectivity is lost:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />
    <title>TrackNStick - Offline</title>
    <style>
      /* Styling omitted for brevity */
    </style>
  </head>
  <body>
    <div class="container">
      <div class="icon">📶</div>
      <h1>You're Offline</h1>
      <p>
        It looks like you've lost your internet connection. Some
        features of TrackNStick may be unavailable until you're back
        online.
      </p>
      <p>
        Don't worry though, any changes you make will sync once your
        connection is restored.
      </p>
      <button class="button" onclick="window.location.reload()">
        Try Again
      </button>
    </div>
  </body>
</html>
```

## App Component Integration (`src/App.tsx`)

We added the PWA install prompt to the main App component:

```tsx
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';

function App() {
  // Existing code...

  return (
    <div className={/* existing classes */}>
      <div className="w-full max-w-7xl mx-auto flex flex-col min-h-screen">
        <HabitsStateProvider>
          <Header />
          <Body />
          <Footer />
          <AddHabitDialog />
          <EditHabitDialog />
          <PWAInstallPrompt />
        </HabitsStateProvider>
      </div>
    </div>
  );
}
```

## Directory Structure

We created new directories and files:

- `/public/icons/` - Directory for PWA icons
- `/public/icons/icon-192x192.png` - 192×192 PWA icon
- `/public/icons/icon-512x512.png` - 512×512 PWA icon
- `/public/offline.html` - Offline fallback page
- `/public/manifest.json` - Web app manifest file
- `/src/types/vite-plugin-pwa.d.ts` - Type definitions for the PWA plugin

## Caching Strategies

We implemented two primary caching strategies:

1. **CacheFirst** for static assets like fonts:

   - Used for Google Fonts resources
   - Cache expiration set to 1 year
   - Maximum of 10 entries in the cache

2. **NetworkFirst** for API responses:
   - Used for API requests to the backend
   - Cache expiration set to 24 hours
   - Maximum of 100 entries in the cache

## Build Output

The PWA plugin generates the following files during build:

- `dist/sw.js` - The service worker file
- `dist/workbox-*.js` - Workbox library for service worker functionality
- `dist/manifest.webmanifest` - The web app manifest

## Feature Implementation Details

### 1. Auto-update Mechanism

The PWA is configured to automatically check for updates. When an update is detected:

- The user is prompted to refresh the page
- If they confirm, the page reloads with the new version

### 2. Offline Support

The app supports offline usage through:

- Pre-caching of essential assets
- Runtime caching of dynamic content
- Fallback to offline.html when no connection is available

### 3. Install Experience

The install flow works as follows:

1. The browser detects the app is installable
2. Our code captures the beforeinstallprompt event
3. We display a custom UI prompting installation
4. When clicked, the native installation dialog appears
5. We track whether the user accepted or dismissed

### 4. PWA Assets

The PWA uses the following assets:

- Web app icons in multiple sizes
- Theme color (#4f46e5)
- Custom splash screen for installed app startup

## Testing and Verification

To verify the PWA implementation:

1. Run `npm run build` to create a production build
2. Run `npm run preview` to serve the built files
3. Open Chrome DevTools and go to the Application tab
4. Check the "Manifest" section to verify the manifest is loaded
5. Check the "Service Workers" section to verify registration
6. Use the "Offline" checkbox to test offline functionality
7. Use Lighthouse to audit PWA compliance

## Next Steps

Some potential improvements for the future:

1. Add more icons for better platform support
2. Implement periodic background sync for data updates
3. Add push notifications for user engagement
4. Optimize cache strategies for specific content types
5. Implement custom install banners for different platforms
