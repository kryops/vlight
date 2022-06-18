import { platform } from 'os'

/** Flag whether the application is stared in development mode. */
export const isDevelopment = process.env.NODE_ENV === 'development'

/** Flag whether the application is running in a Windows environment. */
export const onWindows = platform() === 'win32'
