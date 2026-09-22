const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

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
    ignores: ['dist/*', '.rnstorybook/storybook.requires.ts', 'tests/types/**'],
  },
]);
