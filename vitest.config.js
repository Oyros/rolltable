import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Only the pure helpers are covered; they run in plain Node in
    // milliseconds. A couple of them touch localStorage, so give them a stub
    // rather than pulling in a whole DOM.
    include: ['src/**/*.test.js'],
    environment: 'node',
    setupFiles: ['./src/test/setup.js'],
  },
});
