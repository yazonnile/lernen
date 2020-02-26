module.exports =  {
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      impliedStrict: true
    },
    allowImportExportEverywhere: true
  },
  env: {
    es6: true,
    browser: true
  },
  globals: {
    PRODUCTION: false
  },
  overrides: [
    {
      files: ['**/*.svelte'],
      processor: 'svelte3/svelte3',
      plugins: ['svelte3'],
      settings: {
        'svelte3/ignore-styles': ({ global }) => {
          return !!global;
        },
      }
    }, {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      extends: [
        'plugin:@typescript-eslint/recommended'
      ],
      rules: {
        // '@typescript-eslint/no-explicit-any': 'off',
        // '@typescript-eslint/explicit-function-return-type': 'off'
      }
    }
  ],
};
