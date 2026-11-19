import {
  useState,
  useMemo,
  PropsWithChildren,
  createContext,
  useEffect,
} from 'react'

import { lightTheme } from './ui/theme'
import { defaultSettings, loadSettings, saveSettings } from './settings-storage'

/**
 * Frontend settings that are persisted in the local storage.
 */
export interface Settings {
  /**
   * Controls whether to display the frontend in light or dark mode.
   *
   * Defaults to `true`.
   */
  lightMode: boolean

  /**
   * Displays a mini-map of the current DMX state in the bottom right corner.
   *
   * NOTE: This may cause performance issues on slow devices.
   *
   * Defaults to `false`.
   */
  miniMap: boolean
}

export interface SettingsWithUpdate extends Settings {
  /** Applies the given update to the frontend settings. */
  updateSettings: (settings: Partial<Settings>) => void
}

/**
 * React context that provides the frontend settings as well as a method to change them.
 *
 * Use via the `useSettings` Hook.
 */
export const SettingsContext = createContext<SettingsWithUpdate>({
  ...defaultSettings,
  updateSettings: () => {},
})

/**
 * Wrapper component that provides the {@link SettingsContext}
 * and takes care of switching between light/dark mode.
 */
export function SettingsWrapper({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  const { lightMode } = settings

  useEffect(() => {
    const root = document.documentElement
    if (lightMode) root.classList.add(lightTheme)
    else root.classList.remove(lightTheme)
  }, [lightMode])

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const settingsWithUpdate: SettingsWithUpdate = useMemo<SettingsWithUpdate>(
    () => ({
      ...settings,
      updateSettings: partial =>
        setSettings(prevSettings => ({ ...prevSettings, ...partial })),
    }),
    [settings]
  )

  return (
    <SettingsContext value={settingsWithUpdate}>{children}</SettingsContext>
  )
}
