export type ColorShade = 0 | 1 | 2 | 3 | 4

type RequestIdleCallbackHandle = any
interface RequestIdleCallbackOptions {
  timeout: number
}
interface RequestIdleCallbackDeadline {
  readonly didTimeout: boolean
  timeRemaining: () => number
}

declare global {
  interface Window {
    requestIdleCallback?: (
      callback: (deadline: RequestIdleCallbackDeadline) => void,
      opts?: RequestIdleCallbackOptions
    ) => RequestIdleCallbackHandle
    cancelIdleCallback?: (handle: RequestIdleCallbackHandle) => void
  }
}
