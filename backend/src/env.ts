import { platform } from 'os'

export const onWindows = platform() === 'win32'
