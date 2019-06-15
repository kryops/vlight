import { FixtureGroup } from '@vlight/entities'
import React from 'react'

import { fixtureTypes, fixtures } from '../../api/masterdata'
import { useAppState } from '../../hooks/api'
import { isTruthy, isUnique } from '../../util/validation'
import { flat } from '../../util/array'

import { StatelessFixtureGroupWidget } from './widget'

export interface Props {
  group: FixtureGroup
}

export const FixtureGroupWidget: React.SFC<Props> = ({ group }) => {
  const appState = useAppState()
  const groupState = appState.fixtureGroups[group.id]
  if (!groupState) {
    return null
  }

  const groupFixtures = group.fixtures
    .map(id => fixtures.get(id))
    .filter(isTruthy)
  const groupFixtureTypes = groupFixtures
    .map(({ type }) => fixtureTypes.get(type))
    .filter(isTruthy)
    .filter(isUnique)
  const groupMapping = flat(
    groupFixtureTypes.map(({ mapping }) => mapping)
  ).filter(isUnique)

  return (
    <StatelessFixtureGroupWidget
      group={group}
      groupMapping={groupMapping}
      groupState={groupState}
    />
  )
}
