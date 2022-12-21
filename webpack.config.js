const path = require('path');

module.exports = {
  entry: {
    app: './src/app/index.tsx',
    cmd: './src/cmd/index.ts',
    server: './src/server/index.ts'
  },
  mode: "development",
  output: {
    filename: '[name].bundle.js',
     path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
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
    ]
  },
  // devServer: {
  //   contentBase: path.join(__dirname, "public/"),
  //   port: 3000,
  //   publicPath: "http://localhost:3000/dist/",
  //   hotOnly: true
  // },
}
