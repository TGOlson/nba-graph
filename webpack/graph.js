const path = require('path'); // eslint-disable-line @typescript-eslint/no-var-requires

module.exports = {
  entry: path.resolve(__dirname, '../src/graph/index.ts'),
  mode: 'development',
  target: 'node',
  devtool: 'inline-source-map',
  output: {
    filename: 'graph.bundle.js',
    path: path.resolve(__dirname, '../dist')
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
};
