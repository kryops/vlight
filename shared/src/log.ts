export type LogAppenderFn = (...args: any[]) => void

export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  NONE = 'none',
}

export interface LogAppender {
  trace: LogAppenderFn
  debug: LogAppenderFn
  info: LogAppenderFn
  warn: LogAppenderFn
  error: LogAppenderFn
}

function date() {
  return '[' + new Date().toISOString().substring(11, 23) + ']'
}

export class ConsoleLogAppender implements LogAppender {
  trace(...args: any[]): void {
    console.log(date(), 'TRACE', ...args)
  }
  debug(...args: any[]): void {
    console.log(date(), 'DEBUG', ...args)
  }
  info(...args: any[]): void {
    console.log(date(), 'INFO', ...args)
  }
  warn(...args: any[]): void {
    console.warn(date(), 'WARN', ...args)
  }
  error(...args: any[]): void {
    console.error(date(), 'TRACE', ...args)
  }
}

let appender = new ConsoleLogAppender()
let logLevel =
  process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO

export function setLogAppender(newAppender: LogAppender): void {
  appender = newAppender
}

export function setLogLevel(newLogLevel: LogLevel): void {
  logLevel = newLogLevel
}

export const logger = {
  trace(...args: any[]): void {
    if (logLevel !== LogLevel.TRACE) return
    appender.trace(...args)
  },
  debug(...args: any[]): void {
    if (logLevel !== LogLevel.TRACE && logLevel !== LogLevel.DEBUG) return
    appender.debug(...args)
  },
  info(...args: any[]): void {
    if (
      logLevel === LogLevel.ERROR ||
      logLevel === LogLevel.WARN ||
      logLevel === LogLevel.NONE
    )
      return
    appender.info(...args)
  },
  warn(...args: any[]): void {
    if (logLevel === LogLevel.ERROR || logLevel === LogLevel.NONE) return
    appender.warn(...args)
  },
  error(...args: any[]): void {
    if (logLevel === LogLevel.NONE) return
    appender.error(...args)
  },
}
