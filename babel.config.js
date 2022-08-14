const isTest = process.env.NODE_ENV === 'test'
const isDevelopment = process.env.NODE_ENV === 'development'

module.exports = function (api) {
  api.cache(true)

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: isTest ? 'commonjs' : false,
          useBuiltIns: 'entry',
          corejs: '3.21',
        },
      ],
      [
        '@babel/preset-react',
        {
          runtime: 'automatic',
        },
      ],
      '@babel/preset-typescript',
      '@linaria',
    ],
    plugins: [
      [
        '@babel/plugin-transform-runtime',
        {
          useESModules: !isTest,
        },
      ],

      // stage-3
      '@babel/plugin-syntax-dynamic-import',
      ['@babel/plugin-proposal-class-properties', { loose: false }],
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator',

      // optimization
      '@babel/plugin-transform-react-constant-elements',

      // development
      isDevelopment && [
        'react-refresh/babel',
        {
          skipEnvCheck: true,
        },
      ],
    ].filter(Boolean),
  }
}
