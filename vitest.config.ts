import { defineConfig } from 'vitest/config';

// Unit tests cover the pure logic: input validation, rate limiting, the stream
// reader, what the chat assistant is told, and the sculpture shapes.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'server/**/*.test.ts'],
  },
});
