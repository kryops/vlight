import { css } from '@linaria/core'
import { useState } from 'react'
import { Link } from 'react-router'

import { useSettings } from '../../../hooks/settings'
import { useMapSettings } from '../../../hooks/api'
import { Settings } from '../../../settings'
import { Clickable } from '../../../ui/components/clickable'
import { BackArrow } from '../../../ui/components/back-arrow'
import { configPageRoute } from '../../routes'
import { showDialog } from '../../../ui/overlays/dialog'
import { resetState, setProjectSettings } from '../../../api'
import { yesNo } from '../../../ui/overlays/buttons'
import { Label } from '../../../ui/forms/label'
import { CheckboxLabel } from '../../../ui/forms/checkbox'
import { NumberInput } from '../../../ui/forms/typed-input'
import { Button } from '../../../ui/buttons/button'
import { baseline, textShade } from '../../../ui/styles'

const section = css`
  margin-bottom: ${baseline(8)};
`

const sectionDescription = css`
  margin-top: -${baseline(2)};
  color: ${textShade(1)};
`

const dimensionInput = css`
  flex: 0 1 auto;
  width: ${baseline(20)};
`

const dimensionSeparator = css`
  margin: 0 ${baseline(2)};
`

const promptResetState = async () => {
  const result = await showDialog(
    <>
      Do you really want to reset the state for all controls?
      <br />
      <br />
      THIS WILL TURN OFF EVERYTHING AND DELETE LIVE MEMORIES AND LIVE CHASES!
    </>,
    yesNo
  )
  if (result) resetState()
}

const isValidMapDimension = (value: number | undefined): value is number =>
  value !== undefined && value > 0

const MapSizeInput = () => {
  const mapSettings = useMapSettings()
  const [width, setWidth] = useState<number | undefined>(mapSettings.width)
  const [height, setHeight] = useState<number | undefined>(mapSettings.height)

  // apply changes from the server
  const [prevMapSettings, setPrevMapSettings] = useState(mapSettings)
  if (mapSettings !== prevMapSettings) {
    setPrevMapSettings(mapSettings)
    setWidth(mapSettings.width)
    setHeight(mapSettings.height)
  }

  const changed = width !== mapSettings.width || height !== mapSettings.height
  const valid = isValidMapDimension(width) && isValidMapDimension(height)

  const apply = () => {
    if (!isValidMapDimension(width) || !isValidMapDimension(height)) return
    setProjectSettings({ map: { width, height } })
  }

  return (
    <Label
      label="Map size"
      description="Width x height. All fixture positions and sizes refer to this (default: 100x100)."
      input={
        <>
          <NumberInput
            value={width}
            onChange={setWidth}
            min={1}
            step={1}
            className={dimensionInput}
            aria-label="Map width"
          />
          <span className={dimensionSeparator}>x</span>
          <NumberInput
            value={height}
            onChange={setHeight}
            min={1}
            step={1}
            className={dimensionInput}
            aria-label="Map height"
          />
          {changed && (
            <Button onClick={apply} disabled={!valid}>
              Apply
            </Button>
          )}
        </>
      }
    />
  )
}

/**
 * The settings page.
 *
 * Allows changing the settings of this device as well as the project settings,
 * and resetting the backend state.
 */
const SettingsPage = () => {
  const settings = useSettings()
  const { lightMode, miniMap, updateSettings } = settings

  const toggleSetting = (setting: keyof Settings) =>
    updateSettings({ [setting]: !settings[setting] })

  return (
    <div>
      <h1>
        <BackArrow to={configPageRoute} />
        <Link to={configPageRoute}>Settings</Link>
      </h1>

      <section className={section}>
        <h2>This Device</h2>
        <p className={sectionDescription}>Stored in this browser only.</p>
        <p>
          <CheckboxLabel
            value={lightMode}
            onChange={() => toggleSetting('lightMode')}
          >
            Light mode
          </CheckboxLabel>
        </p>
        <p>
          <CheckboxLabel
            value={miniMap}
            onChange={() => toggleSetting('miniMap')}
          >
            Mini map (large screens only)
          </CheckboxLabel>
        </p>
      </section>

      <section className={section}>
        <h2>Project</h2>
        <p className={sectionDescription}>
          Stored on the server, applies to all devices.
        </p>
        <MapSizeInput />
        <p>
          <Clickable onClick={promptResetState}>Reset state</Clickable>
        </p>
      </section>
    </div>
  )
}

export default SettingsPage
