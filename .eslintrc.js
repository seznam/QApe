module.exports = {
  'extends': ['eslint:recommended', 'plugin:react/recommended', 'prettier', 'prettier/react'],
  'parser': 'babel-eslint',
  'rules': {
    'prettier/prettier': [
      'error', {
        singleQuote: true,
        semi: true,
        tabWidth: 4,
        printWidth: 110,
        trailingComma: 'es5',
        jsxBracketSameLine: true
      }
    ],

    'no-console': 0,

    'react/prop-types': 0,
    'react/wrap-multilines': 0,
    'react/display-name': 0,
  },
  'plugins': [
    'prettier',
    'jest',
    'react',
    'jasmine'
  ],
  'settings': {
    'ecmascript': 2015,
    'jsx': true,
    'react': {
      version: '16'
    }
  },
  'parserOptions': {
    'sourceType': 'module',
    'ecmaVersion': 6,
    'ecmaFeatures': {
      'jsx': true
    }
  },
  'env': {
    'browser': true,
    'node': true,
    'es6': true,
    'jasmine': true,
    'jest/globals': true
  },
  'globals': {
    '$Debug': true,
    '$IMA': true,
    'jsdom': true
  }
};
