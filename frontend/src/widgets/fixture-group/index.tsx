import { FixtureGroup } from '@vlight/entities'
import React, { useMemo, useState, useCallback } from 'react'

import {
  useMasterData,
  useMasterDataMaps,
  useApiStateEntry,
} from '../../hooks/api'
import { isTruthy, isUnique } from '../../util/validation'

import { StatelessFixtureGroupWidget } from './widget'

export interface Props {
  group: FixtureGroup
}

export const FixtureGroupWidget: React.SFC<Props> = ({ group }) => {
  const masterData = useMasterData()
  const groupState = useApiStateEntry('fixtureGroups', group.id)

  const { fixtures, fixtureTypes } = useMasterDataMaps()
  const [colorPicker, setColorPicker] = useState(true)
  const toggleColorPicker = useCallback(() => setColorPicker(prev => !prev), [])

  const groupFixtures = group.fixtures
    .map(id => fixtures.get(id))
    .filter(isTruthy)
  const groupFixtureTypes = groupFixtures
    .map(({ type }) => fixtureTypes.get(type))
    .filter(isTruthy)
    .filter(isUnique)
  const groupMapping = useMemo(
    () => groupFixtureTypes.flatMap(({ mapping }) => mapping).filter(isUnique),
    [group, masterData] // eslint-disable-line
  )

  if (!groupState) {
    return null
  }

  return (
    <StatelessFixtureGroupWidget
      group={group}
      groupMapping={groupMapping}
      groupState={groupState}
      colorPicker={colorPicker}
      toggleColorPicker={toggleColorPicker}
    />
  )
}
