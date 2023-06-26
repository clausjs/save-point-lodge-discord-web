const dotenv = require('dotenv').config();
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { EnvironmentPlugin } = require('webpack');
// const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin');

const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: {
      app: './build/index.js'
  },
  output: {
    filename: 'main.bundle.js',
    path: path.resolve(__dirname, 'build'),
    publicPath: '/'
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [ 
          //Creates 'style' nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader' 
        ],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.tsx', '.d.ts', '.ts']
  },
  devServer: {
    historyApiFallback: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, './src/sass'),
          to: path.resolve(__dirname, './build/sass')
        }
      ]
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
    new EnvironmentPlugin(["DISCORD_API"]),
  ].concat(devMode ? [] : [new MiniCssExtractPlugin()])
};