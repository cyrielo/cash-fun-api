const path = require('path');

const appEntry = path.resolve(__dirname, 'app');
const appOutput = path.resolve(__dirname, 'dist');

const config = {
  target: 'node',
  entry: `${appEntry}/index.js`,
  output: {
    path: appOutput,
    filename: 'bundle.min.js',
    libraryTarget: 'commonjs'
  },
  externals: [
    /^(?!\.|\/).+/i
  ],
  module: {
    rules: [
    {
      test: /\.js$/,
      include: appEntry,
      loader: ['babel-loader']
    }
  ]}
};

module.exports = config;
