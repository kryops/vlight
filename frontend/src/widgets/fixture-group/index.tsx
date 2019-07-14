import { FixtureGroup } from '@vlight/entities'
import React, { useMemo, useState, useCallback } from 'react'

import { useAppState, useMasterData, useMasterDataMaps } from '../../hooks/api'
import { isTruthy, isUnique } from '../../util/validation'
import { flat } from '../../util/array'

import { StatelessFixtureGroupWidget } from './widget'

export interface Props {
  group: FixtureGroup
}

export const FixtureGroupWidget: React.SFC<Props> = ({ group }) => {
  const appState = useAppState()
  const masterData = useMasterData()
  const { fixtures, fixtureTypes } = useMasterDataMaps()
  const groupState = appState.fixtureGroups[group.id]
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
    () =>
      flat(groupFixtureTypes.map(({ mapping }) => mapping)).filter(isUnique),
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
