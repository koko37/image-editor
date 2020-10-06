module.exports = {
  root: true,
  env: { node: true },
  extends: [
    'eslint:recommended',
    'plugin:vue/essential',
    'airbnb-base',
    'prettier',
    'prettier/vue',
    'plugin:prettier/recommended'
  ],
  rules: {
    'comma-dangle': 'off',
    'import/no-unresolved': 'off',
    'prettier/prettier': 'warn',
    indent: [
      2,
      2,
    ]
  },
};
