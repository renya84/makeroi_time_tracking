const {merge} = require('webpack-merge');
const common = require('./webpack.common');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

const config = require('./config.js');
const classNames = 'makeroi-'+config.prefix+'__[hash:base64:6]';

module.exports = merge(common, {
    mode: 'development',
    devtool: 'source-map',
    optimization: {
        minimize: true,
    },
    module:{
        rules:[
            {
                test: /\.s[ac]ss$/i,
                use: [MiniCssExtractPlugin.loader,
                    {loader: 'css-loader', options: {modules: {localIdentName: classNames, exportLocalsConvention: 'camelCase'}}},
                    'sass-loader'],
                include: /\.module\.s[ac]ss$/i
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, {
                    loader: 'css-loader', options: {modules: {localIdentName: classNames, exportLocalsConvention: 'camelCase'}}
                }],
                include: /\.module\.css$/i
            },
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            PRODUCTION: true
        }),
    ]
});