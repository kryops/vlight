import { useContext } from 'react'

import { SettingsContext } from '../settings'

export function useSettings() {
  return useContext(SettingsContext)
}
