import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv("test", process.cwd(), "");

  return {
    plugins: [tsconfigPaths(), react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      env: {
        ...env,
        NODE_ENV: "test",
      },
      setupFiles: ['./vitest.integration.setup.ts'],
      hookTimeout: 60000, // 60s for server start/stop
      testTimeout: 30000, // 30s per test
      fileParallelism: false, // Run test files sequentially for isolation
      maxWorkers: 1, // Single worker to prevent race conditions
      include: [
        'app/components/features/basket/__tests__/integration/**/*.test.ts',
        'tests/checkout/integration/**/*.test.ts',
        'tests/live/**/*.spec.ts',
        'tests/live/**/*.spec.tsx',
      ],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
      ],
    },
  };
});
