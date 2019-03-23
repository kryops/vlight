import { logLevel } from '../config'

export const shouldLogTrace = logLevel === 'trace'
export const shouldLogInfo = shouldLogTrace || logLevel === 'info'
export const shouldLogWarn = shouldLogInfo || logLevel === 'warn'

function noop(..._: any[]) {
  // do nothing
}

function date() {
  return '[' + new Date().toISOString().substring(11, 23) + ']'
}

export const logTrace = shouldLogTrace
  ? (...args: any[]) => console.log(date(), 'TRACE', ...args)
  : noop
export const logInfo = shouldLogInfo
  ? (...args: any[]) => console.log(date(), 'INFO', ...args)
  : noop
export const logWarn = shouldLogWarn
  ? (...args: any[]) => console.log(date(), 'WARN', ...args)
  : noop
export const logError = (...args: any[]) =>
  console.error(date(), 'ERROR', ...args)
