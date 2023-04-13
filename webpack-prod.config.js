const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
    entry : {
        index : [
            path.resolve( __dirname, './src/index.js' ),
        ],
    },
    module : {
        rules : [
            {
                test    : /\.(js|jsx)(\?.*)?$/,
                exclude : /(node_modules|bower_components)/,
                use     : {
                    loader  : 'babel-loader',
                    options : {
                        presets : ['@babel/preset-env'],
                    },
                },
            },
            {
                test : /\.vue$/,
                use  : [
                    {
                        loader : 'vue-loader',
                    },
                ],
            },
            {
                test : /\.less$/,
                use  : [
                    'style-loader',
                    'css-loader',
                    'less-loader',
                ],
            },
        ],
    },
    output : {
        path          : path.resolve( __dirname, './dist' ),
        filename      : '[name].js',
        library       : 'auth-frontend',
        libraryTarget : 'umd',

    },
    plugins : [
        new VueLoaderPlugin(),
    ],
    externals : {
        'vue-i18n'               : 'vue-i18n',
        'axios'                  : 'axios',
        ['@regru/design-system'] : {
            root      : '@regru/design-system',
            amd       : '@regru/design-system',
            commonjs  : '@regru/design-system',
            commonjs2 : '@regru/design-system',
        },
        ['@regru/ds-tokens'] : {
            root      : '@regru/ds-tokens',
            amd       : '@regru/ds-tokens',
            commonjs  : '@regru/ds-tokens',
            commonjs2 : '@regru/ds-tokens',
        },
        ['@regru/reg-jwt'] : {
            root      : '@regru/reg-jwt',
            amd       : '@regru/reg-jwt',
            commonjs  : '@regru/reg-jwt',
            commonjs2 : '@regru/reg-jwt',
        },
    },
};
