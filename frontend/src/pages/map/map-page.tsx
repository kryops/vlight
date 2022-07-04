import { css } from '@linaria/core'
import { useReducer, useRef, useState } from 'react'
import { Dictionary, FixtureState } from '@vlight/types'

import { memoInProduction } from '../../util/development'
import { Header } from '../../ui/containers/header'
import { MapWidget } from '../../widgets/map/map-widget'
import { baseline } from '../../ui/styles'
import { Button } from '../../ui/buttons/button'
import { useApiState, useMasterDataAndMaps } from '../../hooks/api'
import {
  getCommonFixtureMapping,
  mergeFixtureStates,
} from '../../../../shared/controls/src'
import { FixtureStateWidget } from '../../widgets/fixture/fixture-state-widget'
import { setFixtureState } from '../../api'

export const page = css`
  margin: -${baseline(1)};
`

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
  const masterDataAndMaps = useMasterDataAndMaps()
  const fixtureStates = useApiState('fixtures')

  const backupStateRef = useRef<Dictionary<FixtureState>>({})

  return (
    <>
      <Header>Map</Header>
      <div className={page}>
        <MapWidget
          standalone={true}
          displayChannels={fixtureTestMode}
          onFixtureDown={
            fixtureTestMode
              ? fixture => {
                  if (!(fixtureStates[fixture.id] as any)?.__test)
                    backupStateRef.current[fixture.id] =
                      fixtureStates[fixture.id]
                  return setFixtureState(fixture.id, fixtureTestState)
                }
              : undefined
          }
          onFixtureUp={
            fixtureTestMode
              ? fixture => {
                  const backupState = backupStateRef.current[fixture.id] ?? {
                    on: false,
                    channels: {},
                  }
                  return setFixtureState(fixture.id, backupState)
                }
              : undefined
          }
        />
        <div>
          <Button active={fixtureTestMode} onClick={toggleFixtureTestMode}>
            Fixture Test Mode
          </Button>
        </div>
        {fixtureTestMode && (
          <FixtureStateWidget
            disableOn
            title="Fixture Test State"
            fixtureState={fixtureTestState}
            mapping={getCommonFixtureMapping(
              masterDataAndMaps.masterData.fixtures.map(fixture => fixture.id),
              masterDataAndMaps
            )}
            onChange={partialState =>
              setFixtureTestState(
                mergeFixtureStates(fixtureTestState, partialState)
              )
            }
          />
        )}
      </div>
    </>
  )
})

export default MapPage
