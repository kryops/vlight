export const socketProcessingInterval =
  process.env.NODE_ENV === 'production' ? 50 : 100 // = 10/20 fps
export const useSocketUpdateThrottling = true
export const devMode = process.env.NODE_ENV !== 'production'
