module.exports = {
  root: true,
  extends: ['@react-native', 'plugin:import/recommended'],
  plugins: ['import'],
  rules: {
    'import/no-unresolved': 'off',
    'import/named': 'off',
    'react-hooks/exhaustive-deps': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    'import/order': [
      'error',
      {
        groups: [
          'builtin', // node:fs, node:path, etc.
          'external', // react, axios, react-native, etc.
          'internal', // @/components, @/hooks, etc.
          ['parent', 'sibling', 'index'], // ./, ../, ./index
        ],
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    'import/core-modules': ['react-native'],
  },
};
