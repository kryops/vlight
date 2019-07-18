import React, { useState, useMemo } from 'react'

export interface Settings {
  lightMode: boolean
}

export interface SettingsWithUpdate extends Settings {
  updateSettings: (settings: Partial<Settings>) => void
}

const localStorageKey = 'vlightSettings'

const defaultSettings: Settings = {
  lightMode: true,
}

const initialSettings = localStorage[localStorageKey]
  ? JSON.parse(localStorage[localStorageKey])
  : defaultSettings

export const SettingsContext = React.createContext<SettingsWithUpdate>({
  ...initialSettings,
  updateSettings: () => {},
})

export const SettingsWrapper: React.FunctionComponent = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(initialSettings)

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
    [settings, setSettings]
  )

  return (
    <SettingsContext.Provider value={settingsWithUpdate}>
      {children}
    </SettingsContext.Provider>
  )
}