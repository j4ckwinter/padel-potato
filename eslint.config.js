const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const foundationStyles = require('./scripts/eslint-rules/foundation-styles.cjs');

const configuredExpo = expoConfig.map((config) => {
  if (!config.plugins?.['@typescript-eslint']) return config;

  return {
    ...config,
    rules: {
      ...config.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
        },
      ],
    },
  };
});

module.exports = defineConfig([
  configuredExpo,
  {
    files: ['src/design-system/**/*.{ts,tsx}', '.rnstorybook/**/*.{ts,tsx}'],
    ignores: [
      'src/design-system/assets/artwork/**',
      'src/design-system/tokens/**',
      '.rnstorybook/storybook.requires.ts',
    ],
    plugins: {
      local: { rules: { 'foundation-styles': foundationStyles } },
    },
    rules: {
      'local/foundation-styles': 'error',
    },
  },
  {
    ignores: ['dist/*', '.rnstorybook/storybook.requires.ts', 'tests/types/**'],
  },
]);
