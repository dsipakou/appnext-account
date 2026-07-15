import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: ['.next/**', 'node_modules/**', 'coverage/**'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    plugins: {
      '@next/next': nextPlugin,
      'simple-import-sort': simpleImportSort,
    },

    rules: {
      ...nextPlugin.configs['core-web-vitals'].rules,

      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',

      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  eslintConfigPrettier,
]);
