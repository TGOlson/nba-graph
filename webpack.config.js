const path = require('path');

// Do I need this anymore? ts-loader seems to handle typecheck and transpile...
// const babelModule = {
//   test: /\.tsx?$/,
//   exclude: /node_modules/,
//   use: {
//     loader: 'babel-loader',
//     options: {
//       presets: [
//         ['@babel/preset-env', { targets: 'defaults' }]
//       ]
//     }
//   }
// }

const tsModule = {
  test: /\.tsx?$/,
  use: 'ts-loader',
  exclude: /node_modules/,
};

const appConfig = {
  entry: './src/app/index.tsx',
  mode: 'development',
  target: 'web',
  watch: true,
  output: {
    filename: 'app.bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: { rules: [tsModule] },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  }
}

const serverConfig = {
  entry: './src/server/index.ts',
  mode: 'development',
  target: 'node',
  watch: true,
  output: {
    filename: 'server.bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: { rules: [tsModule] },
  resolve: {
    extensions: ['.js', '.ts']
  }
}

module.exports = [appConfig, serverConfig]
