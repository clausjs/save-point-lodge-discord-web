const { merge } = require('webpack-merge');

const commonConfig = require('./webpack.config.js');

module.exports = merge(commonConfig, {
    mode: 'production',
    output: {
        clean: true,
        filename: 'main.bundle.js',
        path: path.resolve(__dirname, 'build'),
        publicPath: '/'
    }
});