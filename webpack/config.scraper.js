const path = require('path'); // eslint-disable-line @typescript-eslint/no-var-requires

const tsModule = {
  test: /\.tsx?$/,
  use: 'ts-loader',
  exclude: /node_modules/,
};

module.exports = {
  entry: path.resolve(__dirname, '../src/scraper/index.ts'),
  watch: true,
  mode: 'development',
  target: 'node',
  devtool: 'inline-source-map',
  output: {
    filename: 'scraper.bundle.js',
    path: path.resolve(__dirname, '../dist')
  },
  module: { rules: [tsModule] },
  resolve: {
    extensions: ['.js', '.ts']
  },
};
