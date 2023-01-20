const path = require('path'); // eslint-disable-line @typescript-eslint/no-var-requires

module.exports = {
  entry: path.resolve(__dirname, '../src/app/index.tsx'),
  mode: 'development',
  target: 'web',
  devtool: 'inline-source-map',
  output: {
    filename: 'app.bundle.js',
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/assets/js',
  },
  module: { 
    rules: [{
      test: /\.css$/i,
      use: ["style-loader", "css-loader"],
    }] 
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    fallback: {
      console: false,
    }
  },
  devServer: {
    static: [
      { 
        directory: path.resolve(__dirname, '../public') 
      },
      { 
        directory: path.resolve(__dirname, '../dist'),
        publicPath: '/assets/js',
      },
      { 
        directory: path.resolve(__dirname, '../data'),
        publicPath: '/assets/data',
      },
      { 
        directory: path.resolve(__dirname, '../data/img'),
        publicPath: '/assets/img',
      }      
    ],
    port: 3000,
  },
};
