import eslintConfigPrettier from "eslint-config-prettier";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const sangLogiumPlugin = require("./eslint-plugin-sang-logium.cjs");

export default [
  ...nextVitals,
  ...nextTypeScript,
  {
    plugins: {
      "sang-logium": sangLogiumPlugin,
    },
    rules: {
      // Rule 1: No Jest imports (using built-in no-restricted-imports)
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "jest",
              message: "Use Vitest instead. See AGENTS.md Testing Rules.",
            },
            {
              name: "@testing-library/jest-dom",
              message: "Use Vitest matchers instead. See AGENTS.md Testing Rules.",
            },
            {
              name: "@testing-library/jest-dom/extend-expect",
              message: "Use Vitest matchers instead. See AGENTS.md Testing Rules.",
            },
          ],
        },
      ],

      // Rule 7: No Jest globals (describe, it, expect without import)
      // Disabled for TypeScript - TypeScript handles undefined variable detection
      "no-undef": "off",

      // Custom plugin rules (Rules 2-6, 8)
      "sang-logium/no-clone-element": "error",
      "sang-logium/groq-reference-syntax": "error",
      "sang-logium/no-direct-sanity-in-client": "error",
      "sang-logium/useQueryState-null-check": "warn",
      "sang-logium/test-import-discipline": "warn",
      "sang-logium/server-component-default": "warn",

      // Temporarily disabled for deployment - pre-existing issues
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "warn",
      "react-hooks/set-state-in-effect": "off", // Plugin not configured, pre-existing issues
    },
  },
  eslintConfigPrettier,
  {
    ignores: [
      ".next/**",
      "dist/**",
      "node_modules/**",
      "_archive/**",
      "lib/queue/**", // LEGACY - deprecated checkout-queue system
      "app/api/checkout-queue/**", // LEGACY - deprecated checkout-queue API
      "tests/checkout-queue/**", // LEGACY - deprecated checkout-queue tests
      "app/(test)/checkout-queue/**", // LEGACY - deprecated checkout-queue test UI
      "docs/examples/**", // Documentation files with example syntax
    ],
  },
  {
    files: ["**/*.cjs", "**/*.mjs"],
    rules: {
      // Allow require() in CommonJS (.cjs) and module scripts (.mjs)
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];