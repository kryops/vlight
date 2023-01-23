import { Fixture, FixtureState, FixtureType } from '@vlight/types'
import { mergeFixtureStates } from '@vlight/controls'

import { useMasterDataMaps, useApiStateEntry } from '../../hooks/api'
import { setFixtureState } from '../../api'
import { memoInProduction } from '../../util/development'
import { iconLight } from '../../ui/icons'
import { useEvent } from '../../hooks/performance'
import { WidgetPassthrough } from '../../ui/containers/widget'

import { FixtureStateWidget } from './fixture-state-widget'

export function getFixtureName(
  fixture: Fixture,
  fixtureType: FixtureType
): string {
  if (fixture.name) {
    return `${fixture.channel} ${fixture.name}`
  }
  return `${fixture.channel} ${fixtureType.name}`
}

export interface FixtureWidgetProps extends WidgetPassthrough {
  fixture: Fixture
}

/**
 * Widget to display a fixture.
 */
export const FixtureWidget = memoInProduction(
  ({ fixture, ...passThrough }: FixtureWidgetProps) => {
    const { fixtureTypes } = useMasterDataMaps()
    const fixtureType = fixtureTypes.get(fixture.type)
    const fixtureState = useApiStateEntry('fixtures', fixture.id)

    const onChange = useEvent((partialState: Partial<FixtureState>) =>
      setFixtureState(
        fixture.id,
        mergeFixtureStates(fixtureState, partialState)
      )
    )

    if (!fixtureState || !fixtureType) {
      return null
    }

    return (
      <FixtureStateWidget
        icon={iconLight}
        title={getFixtureName(fixture, fixtureType)}
        fixtureState={fixtureState}
        mapping={fixtureType.mapping}
        {...passThrough}
        onChange={onChange}
      />
    )
  }
)
