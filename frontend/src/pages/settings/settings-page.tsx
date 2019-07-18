import React from 'react'

import { useSettings } from '../../hooks/settings'
import { Settings } from '../../settings'
import { memoInProduction } from '../../util/development'

const _SettingsPage: React.SFC = () => {
  const settings = useSettings()
  const { lightMode, updateSettings } = settings

  const toggleSetting = (setting: keyof Settings) =>
    updateSettings({ [setting]: !settings[setting] })

  return (
    <div>
      <h2>Settings Page</h2>
      <a onClick={() => toggleSetting('lightMode')}>
        Light Mode: {lightMode ? 'on' : 'off'}
      </a>
    </div>
  )
}

export default memoInProduction(_SettingsPage)
