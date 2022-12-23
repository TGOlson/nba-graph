const path = require('path'); // eslint-disable-line @typescript-eslint/no-var-requires

const tsModule = {
  test: /\.tsx?$/,
  use: 'ts-loader',
  exclude: /node_modules/,
};

const appConfig = {
  entry: './src/app/index.tsx',
  mode: 'development',
  target: 'web',
  output: {
    filename: 'app.bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: { rules: [tsModule] },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  devServer: {
    static: [
      { 
        directory: path.join(__dirname, 'public') 
      },
      { 
        directory: path.join(__dirname, 'dist'),
        publicPath: '/dist',
      },
      { 
        directory: path.join(__dirname, 'data'),
        publicPath: '/data',
      }
    ],
    port: 3000,
  },
}

const serverConfig = {
  entry: './src/server/index.ts',
  mode: 'development',
  target: 'node',
  output: {
    filename: 'server.bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: { rules: [tsModule] },
  resolve: {
    extensions: ['.js', '.ts']
  },
}

module.exports = [appConfig, serverConfig]
