const path = require('path');

const babelModule = {
  test: /\.tsx?$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: [
        ['@babel/preset-env', { targets: "defaults" }]
      ]
    }
  }
}

const appConfig = {
  entry: './src/app/index.tsx',
  mode: 'development',
  target: 'web',
  output: {
    filename: 'app.bundle.js',
     path: path.resolve(__dirname, 'dist'),
  },
  module: { rules: [babelModule] },
}

const serverConfig = {
  entry: './src/server/index.ts',
  mode: 'development',
  target: 'node',
  output: {
    filename: 'server.bundle.js',
     path: path.resolve(__dirname, 'dist'),
  },
  module: { rules: [babelModule] },
  resolve: {
    extensions: ['.js', '.ts' ],
  },
}

module.exports = [appConfig, serverConfig];
