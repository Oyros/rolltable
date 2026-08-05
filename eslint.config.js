import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

// Everything is advisory here — nothing should ever block a build.
const asWarnings = (rules) =>
  Object.fromEntries(Object.keys(rules || {}).map((name) => [name, 'warn']));

// Warnings, not errors: the build must never be blocked by style. Run it with
// `npm run lint`.
export default [
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2021 },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...asWarnings(js.configs.recommended.rules),
      ...asWarnings(reactHooks.configs.recommended.rules),
      // JSX makes React "unused" to the base rules; the automatic runtime
      // means we don't import it anyway.
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^[A-Z_]' }],
      'no-undef': 'warn',
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': 'off',
      // react-hooks v7 ships experimental compiler rules that flag ordinary
      // patterns here (Date.now() inside an event handler, a ref read in a
      // callback, a setState in a timer effect). They drown out the two rules
      // that actually catch bugs for us, so they stay off deliberately.
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/incompatible-library': 'off',
      'react-hooks/unsupported-syntax': 'off',
      'react-hooks/globals': 'off',
      'react-hooks/error-boundaries': 'off',
      'react-hooks/config': 'off',
      'react-hooks/gating': 'off',
      'react-hooks/component-hook-factories': 'off',
      'react-hooks/set-state-in-render': 'off',
      'react-hooks/use-memo': 'off',
      'react-hooks/no-deriving-state-in-effects': 'off',
      'react-hooks/void-use-memo': 'off',
    },
  },
  {
    files: ['src/**/*.test.js', 'src/test/**'],
    languageOptions: { globals: { ...globals.node } },
  },
];
