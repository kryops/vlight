import { isDevelopment } from '../config'

// tslint:disable no-console

function noop() {
  // do nothing
}

export const logTrace = isDevelopment
  ? (...args: any) => console.log(...args)
  : noop
export const logInfo = isDevelopment
  ? (...args: any) => console.log(...args)
  : noop
export const logWarn = (...args: any) => console.warn(...args)
export const logError = (...args: any) => console.error(...args)
