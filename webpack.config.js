const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const apiMocker = require('mocker-api');
const mocker = require('./mocker');


module.exports = {
    entry : {
        index : [
            'webpack-dev-server/client?http://localhost:5000',
            path.resolve( __dirname, './webpack-entry.js' ),
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
        path     : path.resolve( __dirname, './dist' ),
        filename : '[name].js',
    },
    devServer : {
        /* eslint no-magic-numbers: "error" */
        port             : 5002,
        host             : '0.0.0.0',
        contentBase      : [path.join( __dirname, './' )],
        disableHostCheck : true,
        clientLogLevel   : 'warning',
        stats            : {
            all      : false,
            errors   : true,
            warnings : true,
        },
        before( app ) {
            apiMocker( app, mocker );
        },
    },
    plugins : [
        new HtmlWebpackPlugin( {
            filename : 'index.html',
            template : 'index.html',
            inject   : true,
        } ),
        new VueLoaderPlugin(),
    ],
};
