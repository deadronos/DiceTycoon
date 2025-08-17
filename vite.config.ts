import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  resolve: {
    alias: {
      '@patashu/break_eternity.js': path.resolve(__dirname, 'libs/@patashu/break_eternity.js/dist/break_eternity.esm.js')
    }
  },
  server: {
    port: 5173
  }
});
