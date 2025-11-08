import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@patashu/break_eternity.js': path.resolve(
        __dirname,
        'libs/@patashu/break_eternity.js/dist/break_eternity.esm.js'
      )
    }
  },
  test: {
    environment: 'jsdom',
    watch: false,
    setupFiles: ['./tests/setupTests.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}']
    }
  }
});
