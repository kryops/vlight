import { css } from '@linaria/core'
import { useReducer, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Dictionary, Fixture, FixtureState } from '@vlight/types'

import { Header } from '../../ui/containers/header'
import { MapWidget } from '../../widgets/map/map-widget'
import { baseline } from '../../ui/styles'
import { Button } from '../../ui/buttons/button'
import { useApiState, useMasterDataAndMaps } from '../../hooks/api'
import { mergeFixtureStates } from '../../../../shared/controls/src'
import { FixtureStateWidget } from '../../widgets/fixture/fixture-state-widget'
import { setFixtureState } from '../../api'
import {
  useCommonChannelStates,
  useCommonFixtureMapping,
} from '../../hooks/fixtures'
import { showDialog } from '../../ui/overlays/dialog'
import { FixtureWidget } from '../../widgets/fixture/fixture-widget'
import { FixtureTypeMapShape } from '../../widgets/map/map-shape'
import { flexWrap } from '../../ui/css/flex'
import { iconConfig } from '../../ui/icons'
import { settingsPageRoute } from '../routes'

const page = css`
  margin: -${baseline(1)};
`

const legendEntry = css`
  padding: ${baseline()};
`
const fixtureTypeStyle = css`
  display: inline-block;
  margin-right: ${baseline(2)};
  transform: none;
  vertical-align: middle;
`

function openFixtureDialog(fixture: Fixture) {
  void showDialog(<FixtureWidget fixture={fixture} />, undefined, {
    showCloseButton: true,
    // cannot close on backdrop as it would close immediately on touch devices
  })
}

/**
 * Map page.
 *
 * Displays a map with all fixtures and their current DMX state.
 *
 * Includes a test mode that
 * - displays each fixture's DMX channel
 * - allows clicking on a fixture to make it light up
 */
const MapPage = () => {
  const [fixtureTestMode, toggleFixtureTestMode] = useReducer(
    value => !value,
    false
  )
  const [fixtureTestState, setFixtureTestState] = useState<
    FixtureState & { __test?: true }
  >({
    on: true,
    channels: {
      m: 255,
      r: 255,
      g: 255,
      b: 255,
      w: 255,
    },
    __test: true,
  })
  const [namesDisplayed, toggleNamesDisplayed] = useReducer(it => !it, false)
  const [mapRotated, toggleMapRotated] = useReducer(it => !it, false)

  const masterDataAndMaps = useMasterDataAndMaps()
  const navigate = useNavigate()
  const fixtureStates = useApiState('fixtures')

  const backupStateRef = useRef<Dictionary<FixtureState>>({})

  const turnFixtureOn = (fixture: Fixture) => {
    if (!(fixtureStates[fixture.id] as any)?.__test)
      backupStateRef.current[fixture.id] = fixtureStates[fixture.id]
    return setFixtureState(fixture.id, fixtureTestState)
  }

  const turnFixtureOff = (fixture: Fixture) => {
    const backupState = backupStateRef.current[fixture.id] ?? {
      on: false,
      channels: {},
    }
    return setFixtureState(fixture.id, backupState)
  }

  const changeFixtureTestState = (partialState: Partial<FixtureState>) =>
    setFixtureTestState(mergeFixtureStates(fixtureTestState, partialState))

  const allFixtureIds = masterDataAndMaps.masterData.fixtures.map(
    fixture => fixture.id
  )
  const fixtureMapping = useCommonFixtureMapping(allFixtureIds)
  const fixtureChannelStates = useCommonChannelStates(allFixtureIds)

  const fixtureTypeIds = new Set(
    masterDataAndMaps.masterData.fixtures.map(fixture => fixture.type)
  )

  return (
    <>
      <Header>Map</Header>
      <div className={page}>
        <div className={flexWrap}>
          <MapWidget
            standalone={true}
            displayChannels={fixtureTestMode}
            key={fixtureTestMode ? '1' : '0'}
            onFixtureDown={fixtureTestMode ? turnFixtureOn : openFixtureDialog}
            onFixtureUp={fixtureTestMode ? turnFixtureOff : undefined}
            displayNames={namesDisplayed}
            rotate180={mapRotated}
          />
          {fixtureTestMode && (
            <div>
              {[...fixtureTypeIds].map(id => {
                const fixtureType =
                  masterDataAndMaps.masterDataMaps.fixtureTypes.get(id)
                if (!fixtureType) return null

                return (
                  <div key={id} className={legendEntry}>
                    <FixtureTypeMapShape
                      fixtureType={fixtureType}
                      className={fixtureTypeStyle}
                    />
                    {fixtureType.name}
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <div>
          <Button active={fixtureTestMode} onClick={toggleFixtureTestMode}>
            Fixture Test Mode
          </Button>

          <Button active={namesDisplayed} onClick={toggleNamesDisplayed}>
            Show Names
          </Button>

          <Button active={mapRotated} onClick={toggleMapRotated}>
            Rotate
          </Button>

          <Button
            icon={iconConfig}
            title="Change the map size in the settings"
            onClick={() => navigate(settingsPageRoute)}
          >
            Map Size
          </Button>
        </div>
        {fixtureTestMode && (
          <FixtureStateWidget
            disableOn
            title="Fixture Test State"
            fixtureState={fixtureTestState}
            mapping={fixtureMapping}
            channelStates={fixtureChannelStates}
            onChange={changeFixtureTestState}
          />
        )}
      </div>
    </>
  )
}

export default MapPage
