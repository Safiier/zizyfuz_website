import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/photography/',
  build: {
    outDir: 'dist/photography',
  },
  plugins: [react()],
});
