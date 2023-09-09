import { css } from '@linaria/core'
import { useReducer, useRef, useState } from 'react'
import { Dictionary, Fixture, FixtureState } from '@vlight/types'

import { memoInProduction } from '../../util/development'
import { Header } from '../../ui/containers/header'
import { MapWidget } from '../../widgets/map/map-widget'
import { baseline } from '../../ui/styles'
import { Button } from '../../ui/buttons/button'
import { useApiState, useMasterDataAndMaps } from '../../hooks/api'
import { mergeFixtureStates } from '../../../../shared/controls/src'
import { FixtureStateWidget } from '../../widgets/fixture/fixture-state-widget'
import { setFixtureState } from '../../api'
import { useEvent } from '../../hooks/performance'
import { useCommonFixtureMapping } from '../../hooks/fixtures'
import { showDialog } from '../../ui/overlays/dialog'
import { FixtureWidget } from '../../widgets/fixture/fixture-widget'

export const page = css`
  margin: -${baseline(1)};
`

function openFixtureDialog(fixture: Fixture) {
  showDialog(<FixtureWidget fixture={fixture} />, undefined, {
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
const MapPage = memoInProduction(() => {
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
  const [mapRotated, toggleMapRotated] = useReducer(it => !it, false)

  const masterDataAndMaps = useMasterDataAndMaps()
  const fixtureStates = useApiState('fixtures')

  const backupStateRef = useRef<Dictionary<FixtureState>>({})

  const turnFixtureOn = useEvent((fixture: Fixture) => {
    if (!(fixtureStates[fixture.id] as any)?.__test)
      backupStateRef.current[fixture.id] = fixtureStates[fixture.id]
    return setFixtureState(fixture.id, fixtureTestState)
  })

  const turnFixtureOff = useEvent((fixture: Fixture) => {
    const backupState = backupStateRef.current[fixture.id] ?? {
      on: false,
      channels: {},
    }
    return setFixtureState(fixture.id, backupState)
  })

  const changeFixtureTestState = useEvent(
    (partialState: Partial<FixtureState>) =>
      setFixtureTestState(mergeFixtureStates(fixtureTestState, partialState))
  )

  const fixtureMapping = useCommonFixtureMapping(
    masterDataAndMaps.masterData.fixtures.map(fixture => fixture.id)
  )

  return (
    <>
      <Header>Map</Header>
      <div className={page}>
        <MapWidget
          standalone={true}
          displayChannels={fixtureTestMode}
          key={fixtureTestMode ? '1' : '0'}
          onFixtureDown={fixtureTestMode ? turnFixtureOn : openFixtureDialog}
          onFixtureUp={fixtureTestMode ? turnFixtureOff : undefined}
          rotate180={mapRotated}
        />
        <div>
          <Button active={fixtureTestMode} onClick={toggleFixtureTestMode}>
            Fixture Test Mode
          </Button>

          <Button active={mapRotated} onClick={toggleMapRotated}>
            Rotate
          </Button>
        </div>
        {fixtureTestMode && (
          <FixtureStateWidget
            disableOn
            title="Fixture Test State"
            fixtureState={fixtureTestState}
            mapping={fixtureMapping}
            onChange={changeFixtureTestState}
          />
        )}
      </div>
    </>
  )
})

export default MapPage
