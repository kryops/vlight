const isTest = process.env.NODE_ENV === 'test'

module.exports = function(api) {
  api.cache(true)

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: isTest ? 'commonjs' : false,
          useBuiltIns: 'entry',
          corejs: 3,
        },
      ],
      '@babel/preset-react',
      '@babel/preset-typescript',
      'linaria/babel',
    ],
    plugins: [
      'react-hot-loader/babel',

      [
        '@babel/plugin-transform-runtime',
        {
          useESModules: !isTest,
        },
      ],

      // stage-3
      '@babel/plugin-syntax-dynamic-import',
      ['@babel/plugin-proposal-class-properties', { loose: false }],
    ],
  }
}
