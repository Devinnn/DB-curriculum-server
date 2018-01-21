module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es6: true
    },
    extends: 'eslint:recommended',
    parser: 'babel-eslint',
    rules: {
        indent: ['error', 4],
        'linebreak-style': ['error', 'windows'],
        quotes: ['error', 'single'],
        semi: ['error', 'always'],
        'generator-star-spacing': 'off',
        'no-console': 0,
        'linebreak-style': ["error", 'unix']
    }
};
