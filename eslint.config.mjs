import js from "@eslint/js";
import globals from "globals";
import babelParser from "@babel/eslint-parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

/**
 * Flat ESLint config without typescript-eslint. That family hard-requires a
 * TypeScript 6 compiler API and throws on the TypeScript 7 toolchain this
 * repo runs, so TS/TSX files parse through Babel's own TypeScript preset
 * instead. Type checking stays with tsc; this gate covers hooks discipline,
 * JSX correctness, and dead code in plain scripts.
 *
 * no-unused-vars stays off for TS/TSX on purpose: Babel cannot see
 * type-only usage, so it flags live imports. no-undef is off there for the
 * same reason: every type annotation looks like an undefined variable.
 * Unused locals and unknown names belong to a follow-up that enables tsc
 * noUnusedLocals and removes the dead imports.
 */
export default [
  {
    ignores: [".next/", "node_modules/", "public/sw.js", "coverage/"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    ...js.configs.recommended,
  },
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-unused-vars": "off",
      "no-undef": "off",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          // preset-typescript detects .tsx by filename; preset-react parses JSX.
          presets: ["@babel/preset-typescript", "@babel/preset-react"],
        },
      },
    },
  },
  {
    files: ["**/*.{jsx,tsx}"],
    ...react.configs.flat["jsx-runtime"],
    rules: {
      ...react.configs.flat["jsx-runtime"].rules,
      // Props are typed, not runtime-checked.
      "react/prop-types": "off",
    },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ...reactHooks.configs.flat.recommended,
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      // Mount-sync and reset-on-prop-change effects are the codebase's standard
      // SSR pattern (client-only init after hydration, pagination resets). They
      // run once per trigger, never cascade, and are covered by tests.
      "react-hooks/set-state-in-effect": "off",
      // The React Compiler is not in use; this rule gives migration advice for
      // a compiler that never runs here.
      "react-hooks/preserve-manual-memoization": "off",
    },
  },
];
