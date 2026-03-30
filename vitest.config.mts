import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [tsconfigPaths()],
    test: {
      globals: true,
      environment: "jsdom",
      env: env,
      setupFiles: ['./vitest.setup.ts'],
    },
  };
});
