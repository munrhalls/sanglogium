import eslintConfigPrettier from "eslint-config-prettier";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default [
  ...nextVitals,
  ...nextTypeScript,
  eslintConfigPrettier,
  {
    ignores: [".next/**", "dist/**", "node_modules/**"],
  }
];