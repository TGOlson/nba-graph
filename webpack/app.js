const path = require('path'); // eslint-disable-line @typescript-eslint/no-var-requires

module.exports = {
  entry: path.resolve(__dirname, '../src/app/index.tsx'),
  mode: 'development',
  target: 'web',
  devtool: 'inline-source-map',
  output: {
    filename: 'app.bundle.js',
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/nba-graph/assets/',
  },
  module: { 
    rules: [{
      test: /\.css$/i,
      use: ["style-loader", "css-loader"],
    }, {
      test: /\.woff/,
      type: 'asset/resource',
      generator: {  //If emitting file, the file path is
        filename: 'fonts/[hash][ext][query]'
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
  devServer: {
    static: [
      { 
        directory: path.resolve(__dirname, '../public') 
      },
      { 
        directory: path.resolve(__dirname, '../data/graph'),
        publicPath: '/nba-graph/assets/data/graph',
      },
      { 
        directory: path.resolve(__dirname, '../data/sprites'),
        publicPath: '/nba-graph/assets/sprites/',
      }      
    ],
    port: 3000,
  },
};
