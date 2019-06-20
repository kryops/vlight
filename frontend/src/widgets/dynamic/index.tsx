import React from 'react'
import { WidgetConfig } from '@vlight/entities'

import { useMasterData } from '../../hooks/api'
import { FixtureWidget } from '../fixture'
import { fixtures, fixtureGroups } from '../../api/masterdata'
import { FixtureGroupWidget } from '../fixture-group'
import { assertNever } from '../../util/typescript'
import { logError } from '../../util/log'
import { memoInProduction } from '../../util/development'

export interface Props {
  config: WidgetConfig
}

const _DynamicWidget: React.SFC<Props> = ({ config }) => {
  useMasterData() // rerender when master data changes

  switch (config.type) {
    case 'universe':
      logError('Channels widget not supported yet!')
      return null

    case 'channels':
      logError('Channels widget not supported yet!')
      return null

    case 'fixture':
      const fixture = fixtures.get(config.id)
      return fixture ? <FixtureWidget fixture={fixture} /> : null

    case 'fixture-group':
      const fixtureGroup = fixtureGroups.get(config.id)
      return fixtureGroup ? <FixtureGroupWidget group={fixtureGroup} /> : null

    default:
      assertNever(config)
      return null
  }
}

export const DynamicWidget = memoInProduction(_DynamicWidget)
