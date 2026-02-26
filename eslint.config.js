import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import { fixupConfigRules } from "@eslint/compat";
import prettierPluginRecommended from "eslint-plugin-prettier/recommended";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const patchedConfig = fixupConfigRules([
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
]);

const config = [
  ...patchedConfig,
  prettierPluginRecommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "**/build/**",
      "**/dist/**",
      "**/.sanity/**",
      "**/sanity/**",
      "**/public/**",
      "**/*.config.js",
      "**/*.config.ts",
      "**/*.json",
      "**/*.csv",
      "**/*.md",
      "**/*.mjs",
      "**/*.bat",
      "**/*.sh",
      "**/*.html",
      "**/.env*",
      "**/backup*.js",
      "**/deploy*.js",
      "**/verify*.js",
      "**/test-results.html",
      "**/tsconfig.tsbuildinfo",
    ],
  },
];

export default config;
