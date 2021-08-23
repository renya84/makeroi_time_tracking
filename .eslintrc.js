module.exports = {
    'env': {
        'browser': true,
        'commonjs': true,
        'es6': true,
        'node': true
    },
    'extends': [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    'parserOptions': {
        'sourceType': 'module'
    },
    'ignorePatterns': [
        '**/dist/*.js'
    ],
    'rules': {
        'indent': [
            'error',
            4
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'always'
        ],
        'no-undef': [
            'warn'
        ],
        '@typescript-eslint/no-var-requires': [
            'off'
        ],
        '@typescript-eslint/no-empty-function': [
            'off'
        ],
        '@typescript-eslint/ban-ts-comment': ['off']
    }
};