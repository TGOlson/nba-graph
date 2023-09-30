const path = require('path'); // eslint-disable-line @typescript-eslint/no-var-requires
const CopyPlugin = require("copy-webpack-plugin"); // eslint-disable-line @typescript-eslint/no-var-requires

module.exports = {
  entry: path.resolve(__dirname, '../src/app/index.tsx'),
  mode: 'development',
  target: 'web',
  devtool: 'inline-source-map',
  output: {
    filename: 'assets/js/app.bundle.js',
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/',
  },
  module: { 
    rules: [{
      test: /\.css$/i,
      use: ["style-loader", "css-loader"],
    }, {
      test: /\.woff/,
      type: 'asset/resource',
      generator: {
        filename: 'assets/fonts/[hash][ext][query]'
      }
    }]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    fallback: {
      console: false,
      url: require.resolve('url/')
    },
    alias: {
      '@mui/material': '@mui/joy',
    },
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'public/index.html', to: 'index.html' },
        { from: 'data/graph', to: 'assets/data/graph' },
        { from: 'data/sprites/*.png', to: 'assets/sprites/[name].png' },
      ],
    }),
  ],
  devServer: {
    port: 3000,
  },
};
