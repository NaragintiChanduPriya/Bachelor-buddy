import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['dist', 'playwright-report', 'test-results', 'public/mockServiceWorker.js', 'coverage'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // react-hook-form's watch() is intentionally not memoizable; the warning is advisory.
      'react-hooks/incompatible-library': 'off',
    },
  },
  // Generic label wrapper: htmlFor is supplied by the caller via props, which this rule
  // cannot see. The Field component wires label, control and error together.
  {
    files: ['src/components/ui/label.tsx'],
    rules: { 'jsx-a11y/label-has-associated-control': 'off' },
  },
  // CLAUDE.md rule 1: only src/mocks/ may touch fixtures and mock internals.
  // Everything else gets data through services -> TanStack Query hooks.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/mocks/**', 'src/main.tsx', 'src/**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/mocks/*', '@/mocks/**', '**/mocks/fixtures/*'],
              message:
                'Components must not import mock data. Use src/lib/api/services/* through a TanStack Query hook instead.',
            },
          ],
        },
      ],
    },
  },
  prettier,
)
