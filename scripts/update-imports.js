#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Define import replacements
const replacements = [
  // UI components
  { from: /@\/components\/ui\//g, to: '@shared/components/ui/' },

  // Hooks
  { from: /@\/hooks\//g, to: '@shared/hooks/' },

  // Utils/lib
  { from: /@\/lib\//g, to: '@shared/utils/' },

  // Services
  { from: /@\/services\//g, to: '@shared/services/' },

  // Types
  { from: /@\/types\//g, to: '@shared/types/' },

  // Constants
  { from: /@\/constants\//g, to: '@shared/constants/' },

  // Context/Providers
  { from: /@\/context\//g, to: '@app/providers/' },

  // Routes
  { from: /@\/routes/g, to: '@app/routes' },

  // Layouts
  { from: /@\/layouts\//g, to: '@shared/components/layouts/' },

  // Components
  {
    from: /@\/components\/ErrorBoundary/g,
    to: '@shared/components/feedback/ErrorBoundary',
  },
  {
    from: /@\/components\/LoadingFallback/g,
    to: '@shared/components/feedback/LoadingFallback',
  },
  {
    from: /@\/components\/PWAInstallPrompt/g,
    to: '@shared/components/feedback/PWAInstallPrompt',
  },

  // App
  { from: /@\/App/g, to: '@app/App' },

  // Utils
  { from: /@\/utils\//g, to: '@shared/utils/' },

  // Test
  { from: /@\/test\//g, to: '@testing/' },

  // Styles
  { from: /@\/index\.css/g, to: '@/styles/index.css' },
];

// Get all TypeScript files
const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['node_modules/**', 'dist/**'],
});

console.log(`Found ${files.length} files to process`);

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  replacements.forEach(({ from, to }) => {
    const newContent = content.replace(from, to);
    if (newContent !== content) {
      changed = true;
      content = newContent;
    }
  });

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated: ${file}`);
  }
});

console.log('Import updates complete!');
