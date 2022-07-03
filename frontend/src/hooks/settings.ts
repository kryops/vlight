import { useContext } from 'react'

import { SettingsContext, SettingsWithUpdate } from '../settings'

/**
 * React Hook that returns the current frontend settings as well
 * as a method to change them.
 */
export function useSettings(): SettingsWithUpdate {
  return useContext(SettingsContext)
}
