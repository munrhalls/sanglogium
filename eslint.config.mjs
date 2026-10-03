import eslintConfigPrettier from "eslint-config-prettier";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const sangLogiumPlugin = require("./tools/eslint-plugin-sang-logium.cjs");

const JEST_PATHS = [
  {
    name: "jest",
    message: "Use Vitest instead. See tests/AGENTS.md Testing Rules.",
  },
  {
    name: "@testing-library/jest-dom",
    message: "Use Vitest matchers instead. See tests/AGENTS.md Testing Rules.",
  },
  {
    name: "@testing-library/jest-dom/extend-expect",
    message: "Use Vitest matchers instead. See tests/AGENTS.md Testing Rules.",
  },
];

// Anchored so it matches "@/features/x/y" and "../features/x/y".
const ENTRY_ONLY = {
  regex: "^(@/|(\\.\\.?/)+)features/[^/]+/(?!(server|actions)$).+",
  message:
    "Import from @/features/<feature> (client-safe), @/features/<feature>/server (server only) or @/features/<feature>/actions (Server Actions). Deep imports are not allowed.",
};

const NO_SANITY = {
  regex: "(^|/)sanity-cms/",
  message:
    "Features must not import sanity-cms. Data access stays in sanity-cms/lib and calls into the feature through @/features/<feature>/server. Only features/<feature>/actions.ts may import sanity-cms.",
};

const NO_APP = {
  regex: "(^|/)app/",
  message:
    "Features and shared/ never import from app/ (routes, server actions, shell). Shared UI lives in shared/ui.",
};

const NO_FEATURES = {
  regex: "(^|/)features/",
  message:
    "shared/ must not import features/. Dependencies run app -> features -> shared.",
};

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
          paths: JEST_PATHS,
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
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: JEST_PATHS,
          patterns: [ENTRY_ONLY],
        },
      ],
    },
  },
  {
    files: ["features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: JEST_PATHS,
          patterns: [ENTRY_ONLY, NO_SANITY, NO_APP],
        },
      ],
    },
  },
  {
    // JEST_PATHS and ENTRY_ONLY are repeated because a later flat-config block
    // replaces the rule for matching files.
    files: ["shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { paths: JEST_PATHS, patterns: [ENTRY_ONLY, NO_APP, NO_FEATURES] },
      ],
    },
  },
  {
    // The only feature files allowed to import sanity-cms; a later flat-config
    // block replaces the rule for matching files, so the jest paths and the
    // entry/app rules are repeated here.
    files: ["features/*/actions.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: JEST_PATHS,
          patterns: [ENTRY_ONLY, NO_APP],
        },
      ],
    },
  },
  {
    // Server-only boundary files of a feature (actions.ts, adapters/) are the only feature files allowed to import sanity-cms.
    files: ["features/*/adapters/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: JEST_PATHS,
          patterns: [ENTRY_ONLY, NO_APP],
        },
      ],
    },
  },
  {
    // The data layer never imports Server Actions (Server Actions import the
    // data layer). ENTRY_ONLY is repeated because a later flat-config block
    // replaces the rule for matching files.
    files: ["sanity-cms/lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: JEST_PATHS,
          patterns: [
            ENTRY_ONLY,
            {
              regex: "^@/features/[^/]+/actions$",
              message:
                "The data layer never imports Server Actions (Server Actions import the data layer).",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "features/**/*.{ts,tsx}",
      "app/components/layout/**/*.{ts,tsx}",
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
      "_archive/**",
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