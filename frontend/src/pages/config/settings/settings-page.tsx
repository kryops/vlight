import React from 'react'

import { useSettings } from '../../../hooks/settings'
import { Settings } from '../../../settings'
import { memoInProduction } from '../../../util/development'
import { Clickable } from '../../../ui/components/clickable'
import { BackArrow } from '../../../ui/components/back-arrow'
import { configPageRoute } from '../../routes'

const SettingsPage = memoInProduction(() => {
  const settings = useSettings()
  const { lightMode, updateSettings } = settings

  const toggleSetting = (setting: keyof Settings) =>
    updateSettings({ [setting]: !settings[setting] })

  return (
    <div>
      <h1>
        <BackArrow to={configPageRoute} />
        Settings
      </h1>
      <Clickable onClick={() => toggleSetting('lightMode')}>
        Light Mode: {lightMode ? 'on' : 'off'}
      </Clickable>
    </div>
  )
})

export default SettingsPage
