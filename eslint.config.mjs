import eslintConfigPrettier from "eslint-config-prettier";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const sangLogiumPlugin = require("./tools/eslint-plugin-sang-logium.cjs");

export default [
  ...nextVitals,
  ...nextTypeScript,
  {
    plugins: {
      "sang-logium": sangLogiumPlugin,
    },
    rules: {
      // TypeScript handles undefined variable detection
      "no-undef": "off",

      // Custom plugin rules (Rules 2-6, 8)
      "sang-logium/no-clone-element": "error",
      "sang-logium/groq-reference-syntax": "error",
      "sang-logium/useQueryState-null-check": "warn",
      "sang-logium/server-component-default": "warn",

      // Temporarily disabled for deployment - pre-existing issues
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "warn",
      "react-hooks/set-state-in-effect": "off", // Plugin not configured, pre-existing issues
    },
  },
  {
    files: [
      "features/**/*.{ts,tsx}",
    ],
    rules: {
      "import/no-cycle": ["warn", { maxDepth: 6 }],
    },
  },
  eslintConfigPrettier,
  {
    ignores: [
      ".next/**",
      "dist/**",
      "node_modules/**",
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