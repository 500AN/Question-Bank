module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
    'no-use-before-define': 'off',
    'no-unused-vars': 'warn'
  },
  env: {
    browser: true,
    es6: true,
    node: true
  }
};