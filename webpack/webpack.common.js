const {IgnorePlugin} = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin'); // installed via npm
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const path = require('path');

const config = require('./config.js');

module.exports = {
    entry: './src/script.js',
    output: {
        filename: 'script.js',
        path: path.resolve(__dirname, '../dist'),
        libraryTarget: 'amd',
        umdNamedDefine: true
    },
    externals: config.externalModules,
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    module: {
        rules: [
            {
                test: /\.(js|ts)$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-typescript'
                        ],
                        plugins: [
                            '@babel/proposal-class-properties',
                            '@babel/proposal-object-rest-spread'
                        ]
                    }
                }
            },
            {
                test: /\.s[ac]ss$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
                exclude: /\.module\.s[ac]ss$/i
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
                exclude: /\.module\.css$/i
            },
        ]
    },
    plugins: [
        new IgnorePlugin(config.regExp),
        new CopyPlugin({
            patterns: [
                {from: './resources/templates',
                    filter: (resourcePath)=>!resourcePath.includes('exclude'),
                    to: 'templates'},
                {from: './resources/images', to: 'images'},
                {from: './resources/i18n', to: 'i18n'},
                {from: './resources/manifest.json', to: 'manifest.json'}
            ]
        }),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin(),
        new ZipPlugin(
            {
                // OPTIONAL: defaults to the Webpack output path (above)
                // can be relative (to Webpack output path) or absolute
                path: '../dist',

                // OPTIONAL: defaults to the Webpack output filename (above) or,
                // if not present, the basename of the path
                filename: 'widget.zip',
                // OPTIONAL: see https://github.com/thejoshwolfe/yazl#addfilerealpath-metadatapath-options
                fileOptions: {
                    mtime: new Date(),
                    mode: 0o100664,
                    compress: true,
                    forceZip64Format: false,
                },

                // OPTIONAL: see https://github.com/thejoshwolfe/yazl#endoptions-finalsizecallback
                zipOptions: {
                    forceZip64Format: false,
                },
            },
        ),
    ]
};