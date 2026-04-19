import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

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
      env: env,
      setupFiles: ['./vitest.integration.setup.ts'],
      hookTimeout: 60000, // 60s for server start/stop
      testTimeout: 30000, // 30s per test
      include: [
        'tests/checkout/guest-checkout-inventory-reservation/integration/**/*.test.tsx',
        'tests/checkout/guest-checkout-inventory-reservation/integration/**/*.test.ts',
        'tests/checkout-queue/integration/**/*.test.ts',
      ],
      exclude: [
        'tests/checkout/guest-checkout-inventory-reservation/integration/**/node_modules/**',
        'tests/checkout/guest-checkout-inventory-reservation/integration/**/dist/**',
      ],
    },
  };
});
