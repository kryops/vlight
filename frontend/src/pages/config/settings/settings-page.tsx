import { Link } from 'react-router-dom'

import { useSettings } from '../../../hooks/settings'
import { Settings } from '../../../settings'
import { memoInProduction } from '../../../util/development'
import { Clickable } from '../../../ui/components/clickable'
import { BackArrow } from '../../../ui/components/back-arrow'
import { configPageRoute } from '../../routes'
import { showDialog } from '../../../ui/overlays/dialog'
import { resetState } from '../../../api'
import { yesNo } from '../../../ui/overlays/buttons'

const SettingsPage = memoInProduction(() => {
  const settings = useSettings()
  const { lightMode, updateSettings } = settings

  const toggleSetting = (setting: keyof Settings) =>
    updateSettings({ [setting]: !settings[setting] })

  const promptResetState = async () => {
    const result = await showDialog(
      <>
        Do you really want to reset the state for all controls?
        <br />
        <br />
        THIS WILL TURN OFF EVERYTHING!
      </>,
      yesNo
    )
    if (result) resetState()
  }

  return (
    <div>
      <h1>
        <BackArrow to={configPageRoute} />
        <Link to={configPageRoute}>Settings</Link>
      </h1>
      <p>
        <Clickable onClick={() => toggleSetting('lightMode')}>
          Light Mode: {lightMode ? 'on' : 'off'}
        </Clickable>
      </p>
      <p>
        <Clickable onClick={promptResetState}>Reset state</Clickable>
      </p>
    </div>
  )
})

export default SettingsPage
