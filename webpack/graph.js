const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: path.resolve(__dirname, '../src/graph/index.ts'),
  mode: 'development',
  target: 'node',
  devtool: 'inline-source-map',
  output: {
    filename: 'graph.bundle.js',
    path: path.resolve(__dirname, '../dist')
  },
  module: { 
    rules: [
      {
        test: /\.node$/,
        use: 'node-loader'
      }
    ],
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(/^vertx/, '@vertx/core')
  ],
  externals : { 
    // canvas: {} 
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
};
