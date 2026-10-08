import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'build',
    rolldownOptions: {
      output: {
        assetFileNames: assetInfo => {
          const sourceName = assetInfo.names?.[0] || assetInfo.name || '';
          return sourceName.endsWith('.mjs')
            ? 'assets/[name]-[hash].js'
            : 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
});
