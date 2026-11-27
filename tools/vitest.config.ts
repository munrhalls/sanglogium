import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { fileURLToPath } from 'node:url';

// Scoped to tests/product-filtering/ui/ only: those proofs import real .tsx
// components, which plain `node --experimental-strip-types` cannot load at all
// (Node's type-stripping explicitly does not support JSX -- see the header
// comments in that directory). tests/product-filtering/backend/ stays on the
// zero-dependency `node --test` harness it already uses; it never imports a
// component, so it has no need for this. Keeping the two scoped apart keeps
// the UI/backend test-tooling boundary as clear as the UI/backend code
// boundary itself.
//
// Default environment is plain Node (no DOM): most of these proofs are a
// static render (react-dom/server) or a direct function call, and get no DOM
// for free until they ask one `// @vitest-environment jsdom` at a time --
// jsdom is a forced, not a default, cost.
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  // tsconfig.json leaves tests/ out, so the plugin above does not resolve '@/' in a test file itself; this does, the same way.
  resolve: { alias: [{ find: /^@\//, replacement: fileURLToPath(new URL('../', import.meta.url)) }] },
  test: {
    include: ['tests/product-filtering/ui/**/*.test.{ts,tsx}'],
    environment: 'node',
  },
});
