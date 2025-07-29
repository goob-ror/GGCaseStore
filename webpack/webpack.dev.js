const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',

  devServer: {
    static: './dist',
    port: 8080,
    hot: true,
    open: true,
    historyApiFallback: true,
    compress: true,
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      }
    ],
    client: {
      overlay: {
        errors: true,
        warnings: false
      },
      progress: true
    },
    watchFiles: ['src/**/*', 'public/**/*']
  },

  optimization: {
    runtimeChunk: 'single'
  }
});