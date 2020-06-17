import React from 'react'

import { useSettings } from '../../hooks/settings'
import { Settings } from '../../settings'
import { memoInProduction } from '../../util/development'

const SettingsPage = memoInProduction(() => {
  const settings = useSettings()
  const { lightMode, updateSettings } = settings

  const toggleSetting = (setting: keyof Settings) =>
    updateSettings({ [setting]: !settings[setting] })

  return (
    <div>
      <h1>Settings</h1>
      <a onClick={() => toggleSetting('lightMode')}>
        Light Mode: {lightMode ? 'on' : 'off'}
      </a>
    </div>
  )
})

export default SettingsPage
