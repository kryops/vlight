import { Fixture, FixtureState, FixtureType } from '@vlight/types'
import { mergeFixtureStates } from '@vlight/controls'

import { useMasterDataMaps, useApiStateEntry } from '../../hooks/api'
import { setFixtureState } from '../../api'
import { iconLight } from '../../ui/icons'
import { useShallowEqualMemo } from '../../hooks/performance'
import { WidgetPassthrough } from '../../ui/containers/widget'
import { addMemoryFromFixtureState } from '../../pages/memories/memories-actions'

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

const emptyMapping: string[] = []

export interface FixtureWidgetProps extends WidgetPassthrough {
  fixture: Fixture
  mapping?: string[]
}

/**
 * Widget to display a fixture.
 */
export const FixtureWidget = ({
  fixture,
  mapping,
  ...passThrough
}: FixtureWidgetProps) => {
  const { fixtureTypes } = useMasterDataMaps()
  const fixtureType = fixtureTypes.get(fixture.type)
  const fixtureState = useApiStateEntry('fixtures', fixture.id)

  const onChange = (partialState: Partial<FixtureState>) =>
    setFixtureState(fixture.id, mergeFixtureStates(fixtureState, partialState))

  const onSave = async () => {
    await addMemoryFromFixtureState({
      fixtureState,
      members: [fixture.id],
      initialName: fixture.name,
    })
  }

  const typeMapping = fixtureType?.mapping ?? emptyMapping
  const activeMapping = useShallowEqualMemo(
    mapping
      ? typeMapping.filter(channel => mapping.includes(channel))
      : typeMapping
  )

  if (!fixtureState || !fixtureType) {
    return null
  }

  return (
    <FixtureStateWidget
      icon={iconLight}
      title={getFixtureName(fixture, fixtureType)}
      fixtureState={fixtureState}
      mapping={activeMapping}
      {...passThrough}
      onChange={onChange}
      onSave={onSave}
      limitedWidth
    />
  )
}
