const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
// const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin');

const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: {
      app: './src/index.js'
  },
  output: {
    filename: 'main.bundle.js',
    path: path.resolve(__dirname, 'build'),
    publicPath: '/',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
            devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader', 'sass-loader'
        ],
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        loader: 'file-loader, url-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.tsx', '.ts']
  },
  devServer: {
    historyApiFallback: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    })
  ].concat(devMode ? [] : [new MiniCssExtractPlugin()])
};