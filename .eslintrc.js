module.exports = {
  'extends': ['eslint:recommended', 'prettier'],
  'parser': 'babel-eslint',
  'rules': {
    'prettier/prettier': [
      'error', {
        singleQuote: true,
        semi: true,
        tabWidth: 4,
        printWidth: 110,
        trailingComma: 'es5'
      }
    ],
  },
  'plugins': [
    'prettier',
    'jest'
  ],
  'env': {
    'browser': true,
    'node': true,
    'es6': true,
    'jest/globals': true
  },
  globals: {
    jasmine: true
  }
};
