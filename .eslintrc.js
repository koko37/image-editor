module.exports = {
  root: true,
  env: { node: true },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
    'prettier',
  ],
  plugins: ['prettier'],
  rules: {
    camelcase: 'off',
    'prettier/prettier': 'error',
    'import/no-unresolved': [
      'error',
      {
        ignore: ['bundles', 'packs', 'styles'],
      },
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/prefer-default-export': 'off',
    'no-unused-vars': 'off',
    'lines-between-class-members': 'off',
    'max-classes-per-file': 'off',
    'no-new': 'off',
  },
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
