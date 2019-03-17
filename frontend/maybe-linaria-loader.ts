import { getRemainingRequest, stringifyRequest } from 'loader-utils'
import { loader } from 'webpack'

function maybeLinariaLoader(
  this: loader.LoaderContext,
  source: string
): string {
  if (source.includes('linaria')) {
    const precedingRequest = this.request.slice(
      0,
      this.request.indexOf(__filename)
    )
    return `export * from ${stringifyRequest(
      this,
      `!${precedingRequest}linaria/loader!${getRemainingRequest(this)}`
    )};\n`
  }
  return source
}

module.exports = maybeLinariaLoader
