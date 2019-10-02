import React from 'react'
import { WidgetConfig } from '@vlight/entities'

import { useMasterDataMaps } from '../hooks/api'
import { assertNever } from '../util/typescript'
import { memoInProduction } from '../util/development'

import { UniverseWidget } from './universe'
import { ChannelsWidget } from './channels'
import { FixtureWidget } from './fixture'
import { FixtureGroupWidget } from './fixture-group'
import { MemoryWidget } from './memory'

export interface DynamicWidgetProps {
  config: WidgetConfig
}

export const DynamicWidget = memoInProduction(
  ({ config }: DynamicWidgetProps) => {
    const { fixtures, fixtureGroups, memories } = useMasterDataMaps()

    switch (config.type) {
      case 'universe':
        return (
          <UniverseWidget
            from={config.from}
            to={config.to}
            title={config.title}
          />
        )

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

      case 'memory':
        const memory = memories.get(config.id)
        return memory ? <MemoryWidget memory={memory} /> : null

      default:
        assertNever(config)
        return null
    }
  }
)
