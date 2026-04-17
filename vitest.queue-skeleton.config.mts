// Dedicated vitest config for checkout-queue-skeleton.
// Skips the default global fetch/console mocks so integration tests can hit
// the real dev server + real Upstash + real console output.

import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import { loadEnv } from 'vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Promote loaded env into process.env so modules reading process.env directly
  // (like @upstash/redis) see the values.
  for (const [k, v] of Object.entries(env)) {
    if (process.env[k] === undefined) process.env[k] = v
  }

  return {
    plugins: [tsconfigPaths()],
    resolve: {
      alias: { '@': path.resolve(__dirname, '.') },
    },
    test: {
      globals: true,
      environment: 'node',
      env,
      include: ['tests/checkout-queue-skeleton/**/*.test.ts'],
      exclude: ['tests/checkout-queue-skeleton/e2e/**'],
      testTimeout: 60_000,
      hookTimeout: 60_000,
      fileParallelism: false,
    },
  }
})
