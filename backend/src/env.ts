import { platform } from 'os'

export const isDevelopment = process.env.NODE_ENV === 'development'
export const devServer = process.env.DEV_SERVER === 'true'
export const onWindows = platform() === 'win32'
