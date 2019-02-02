import { isDevelopment } from '../env'

// tslint:disable no-console

export const shouldLogTrace = isDevelopment
export const shouldLogInfo = shouldLogTrace || isDevelopment

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
export const logWarn = (...args: any[]) => console.warn(date(), 'WARN', ...args)
export const logError = (...args: any[]) =>
  console.error(date(), 'ERROR', ...args)
