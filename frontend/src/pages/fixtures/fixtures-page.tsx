import { Fixture } from '@vlight/entities'
import React, { memo } from 'react'

import { setFixtureState } from '../../api'
import { updateFixtureState } from '../../api/fixture'
import { fixtureTypes } from '../../api/masterdata'
import { useAppState, useMasterData } from '../../hooks/api'
import { Widget } from '../../ui/containers/widget'

function getFixtureName(fixture: Fixture): string {
  if (fixture.name) {
    return `${fixture.channel} ${fixture.name}`
  }

  const fixtureType = fixtureTypes.get(fixture.type)
  if (!fixtureType) {
    return `${fixture.channel}`
  }

  return `${fixture.channel} ${fixtureType.name}`
}

const _FixturesPage: React.SFC = () => {
  const { fixtures } = useMasterData()
  const { fixtures: fixtureStates } = useAppState()

  return (
    <div>
      {fixtures.map(fixture => (
        <Widget key={fixture.id} title={getFixtureName(fixture)}>
          <pre>{JSON.stringify(fixtureStates[fixture.id], null, 2)}</pre>
          <a
            onClick={() =>
              setFixtureState(
                fixture.id,
                updateFixtureState(fixtureStates[fixture.id], {
                  on: !fixtureStates[fixture.id].on,
                })
              )
            }
          >
            Toggle
          </a>
        </Widget>
      ))}
    </div>
  )
}

export default memo(_FixturesPage)
