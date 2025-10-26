import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: '.',
  plugins: [react()],
  resolve: {
    alias: {
      '@patashu/break_eternity.js': path.resolve(__dirname, 'libs/@patashu/break_eternity.js/dist/break_eternity.esm.js')
    }
  },
  server: {
    port: 5173
  }
});
