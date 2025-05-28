const { merge } = require('webpack-merge');

const commonConfig = require('./webpack.config.js');

module.exports = merge(commonConfig, {
  devtool: 'inline-source-map',
  watch: true,
  watchOptions: {
    ignored: ['node_modules/**'],
  },
  devServer: {
    server: 'http',
    host: 'localhost',
    port: 3000,
    historyApiFallback: true,
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:8000/api',
        changeOrigin: true,
      },
    ]
  },
});