import React from 'react'
import { WidgetConfig } from '@vlight/entities'

import { useMasterData } from '../hooks/api'
import { fixtures, fixtureGroups } from '../api/masterdata'
import { assertNever } from '../util/typescript'
import { logError } from '../util/log'
import { memoInProduction } from '../util/development'

import { FixtureGroupWidget } from './fixture-group'
import { FixtureWidget } from './fixture'
import { ChannelsWidget } from './channels'

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
      return (
        <ChannelsWidget
          from={config.from}
          to={config.to}
          title={config.title}
        />
      )

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
