import { css } from '@linaria/core'
import {
  useState,
  useMemo,
  PropsWithChildren,
  createContext,
  useEffect,
} from 'react'

import { getCssVariableDefinitions } from './ui/styles'

const lightTheme = css`
  ${getCssVariableDefinitions(true)}
`

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

const localStorageKey = 'vlightSettings'

const defaultSettings: Settings = {
  lightMode: true,
  miniMap: false,
}

const initialSettings = localStorage[localStorageKey]
  ? { ...defaultSettings, ...JSON.parse(localStorage[localStorageKey]) }
  : defaultSettings

/**
 * React context that provides the frontend settings as well as a method to change them.
 *
 * Use via the `useSettings` Hook.
 */
export const SettingsContext = createContext<SettingsWithUpdate>({
  ...initialSettings,
  updateSettings: () => {},
})

/**
 * Wrapper component that provides the {@link SettingsContext}
 * and takes care of switching between light/dark mode.
 */
export function SettingsWrapper({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<Settings>(initialSettings)

  const { lightMode } = settings

  useEffect(() => {
    const root = document.documentElement
    if (lightMode) root.classList.add(lightTheme)
    else root.classList.remove(lightTheme)
  }, [lightMode])

  const settingsWithUpdate: SettingsWithUpdate = useMemo<SettingsWithUpdate>(
    () => ({
      ...settings,
      updateSettings: partial =>
        setSettings(prevSettings => {
          const newSettings = { ...prevSettings, ...partial }
          localStorage[localStorageKey] = JSON.stringify(newSettings)
          return newSettings
        }),
    }),
    [settings]
  )

  return (
    <SettingsContext.Provider value={settingsWithUpdate}>
      {children}
    </SettingsContext.Provider>
  )
}
