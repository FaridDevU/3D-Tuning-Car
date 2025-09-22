const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    context: path.join(__dirname, 'src'),
    mode: 'development',
    entry: './app/app.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/app.build.js',
        publicPath: '/'
    },
    devServer: {
        static: path.resolve(__dirname, 'src/static'),
        port: 5000,
        open: true
    },
    plugins: [
        new CopyPlugin({ patterns: [{ from: 'static' }] }),
    ],
}