import type { Settings } from './settings'

const localStorageKey = 'vlightSettings'

export const defaultSettings: Settings = {
  lightMode: true,
  miniMap: false,
}

/**
 * Loads the frontend settings from the local storage,
 * falling back to the defaults.
 */
export function loadSettings(): Settings {
  try {
    const stored = localStorage[localStorageKey]
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) }
  } catch {
    // corrupted or inaccessible storage, fall back to the defaults
  }
  return defaultSettings
}

/**
 * Persists the frontend settings in the local storage.
 */
export function saveSettings(settings: Settings): void {
  try {
    localStorage[localStorageKey] = JSON.stringify(settings)
  } catch {
    // inaccessible storage, the settings are only kept in memory
  }
}
