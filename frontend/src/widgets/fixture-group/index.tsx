import { FixtureGroup } from '@vlight/entities'
import React, { useState, useCallback } from 'react'

import { useApiStateEntry } from '../../hooks/api'
import { useCommonFixtureMapping } from '../../hooks/fixtures'

import { StatelessFixtureGroupWidget } from './widget'

export interface FixtureGroupWidgetProps {
  group: FixtureGroup
}

export const FixtureGroupWidget = ({ group }: FixtureGroupWidgetProps) => {
  const groupState = useApiStateEntry('fixtureGroups', group.id)
  const groupMapping = useCommonFixtureMapping(group.fixtures)

  const [colorPicker, setColorPicker] = useState(true)
  const toggleColorPicker = useCallback(() => setColorPicker(prev => !prev), [])

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
