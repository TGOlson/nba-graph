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
