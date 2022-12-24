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
  devtool: 'inline-source-map',
  output: {
    filename: 'app.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/assets/js',
  },
  module: { 
    rules: [
      tsModule,
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ] 
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  devServer: {
    static: [
      { 
        directory: path.resolve(__dirname, 'public') 
      },
      { 
        directory: path.resolve(__dirname, 'dist'),
        publicPath: '/assets/js',
      },
      { 
        directory: path.resolve(__dirname, 'data'),
        publicPath: '/assets/data',
      }
    ],
    port: 3000,
  },
};

const scraperConfig = {
  entry: './src/scraper/index.ts',
  mode: 'development',
  target: 'node',
  devtool: 'inline-source-map',
  output: {
    filename: 'scraper.bundle.js',
    path: path.resolve(__dirname, './dist')
  },
  module: { rules: [tsModule] },
  resolve: {
    extensions: ['.js', '.ts']
  },
};

module.exports = [appConfig, scraperConfig];
