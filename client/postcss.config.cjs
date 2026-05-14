// cssnano 压缩 CSS
module.exports = {
  plugins: [
    require('cssnano')({
      preset: [
        'default',
        {
          discardComments: { removeAll: true },
          calc: { preserve: false },
          normalizeWhitespace: true,
          colormin: true,
          minifySelectors: true,
          minifyParams: true,
          mergeRules: true,
          autoprefixer: false
        }
      ]
    })
  ]
}
