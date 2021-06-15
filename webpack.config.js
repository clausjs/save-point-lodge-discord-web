const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  watch: false,
  watchOptions: {
    ignored: ["node_modules"]
  }, 
  mode: 'development', 
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'build')
  },
  module: {
    rules: [
      {
        test: [/\.js$/, /\.jsx$/],
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      {
        test: [/\.(s*)css$/, /\.sass$/],
        use:['style-loader','css-loader', 'sass-loader']
      },
      {
        test: /\.(png|jpg)$/,
        loader: 'url-loader'
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        loader: 'file-loader?name=/fonts/[name].[ext]'
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    })
  ]
};