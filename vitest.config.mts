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
      setupFiles: ['./vitest.setup.ts'],
    },
  };
});
