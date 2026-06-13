export default function (api) {
  api.cache(true)

  return {
    extends: '../babel.config.js',
  }
}
