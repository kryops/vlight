import { FixtureGroup } from '@vlight/entities'
import React, { useMemo } from 'react'

import { fixtureTypes, fixtures } from '../../api/masterdata'
import { useAppState, useMasterData } from '../../hooks/api'
import { isTruthy, isUnique } from '../../util/validation'
import { flat } from '../../util/array'

import { StatelessFixtureGroupWidget } from './widget'

export interface Props {
  group: FixtureGroup
}

export const FixtureGroupWidget: React.SFC<Props> = ({ group }) => {
  const appState = useAppState()
  const masterData = useMasterData()
  const groupState = appState.fixtureGroups[group.id]

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
    />
  )
}
