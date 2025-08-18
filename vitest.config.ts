import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@patashu/break_eternity.js': path.resolve(__dirname, 'libs/@patashu/break_eternity.js/dist/break_eternity.esm.js')
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setupTests.ts']
  }
});
