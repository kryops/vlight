import { getRemainingRequest } from 'loader-utils'
import { loader } from 'webpack'

function maybeLinariaLoader(
  this: loader.LoaderContext,
  source: string
): string {
  this.cacheable(true)
  if (source.includes('linaria')) {
    // tslint:disable-next-line: no-submodule-imports
    const linariaLoader: loader.Loader = require('linaria/loader')
    return linariaLoader.call(this, source)
    /*
    const precedingRequest = this.request.slice(
      0,
      this.request.indexOf(__filename)
    )
    const newSource = `module.exports = require('!${precedingRequest}${require.resolve(
      'linaria/loader'
    )}!${getRemainingRequest(this)}');\n`
    return newSource
    */
  }
  return source
}

module.exports = maybeLinariaLoader
