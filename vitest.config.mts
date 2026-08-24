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
        // Next.js resolves "server-only" via a built-in shim; Vitest has no
        // such shim and the package isn't an installed dependency. See
        // vitest.setup.server-only-stub.ts for why this is needed.
        "server-only": path.resolve(__dirname, "./vitest.setup.server-only-stub.ts"),
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      env: {
        ...env,
      },
      setupFiles: ['./vitest.setup.ts'],
      include: [
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/*.test.ts',
        '**/*.test.tsx',
      ],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
      ],
    },
  };
});
