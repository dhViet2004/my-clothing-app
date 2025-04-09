import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021
      },
    },
    plugins: {
      js,
    },
    extends: ["plugin:@typescript-eslint/recommended", "plugin:js/recommended"],
  },
  tseslint.configs.recommended,
]);
