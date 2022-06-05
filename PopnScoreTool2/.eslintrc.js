// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'airbnb-base',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  settings: {
  },
  rules: {
    // /*
    'import/extensions': [
      'error', 'always',
      {
      },
    ],
    'no-use-before-define': ['error', {
      functions: false,
      classes: true,
      variables: true,
    }],
    // */
  },
};
