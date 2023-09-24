const { merge } = require('webpack-merge'); // eslint-disable-line @typescript-eslint/no-var-requires
const appDev = require('./app.js'); // eslint-disable-line @typescript-eslint/no-var-requires

module.exports = merge(appDev, {
  // Maybe use if there is a good way to change index.html script tag?
  // output: {
  //   filename: 'app.bundle.prod.js',
  // },
  mode: 'production',
  devtool: 'source-map',
});
