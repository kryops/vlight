import { WidgetConfig } from '@vlight/types'
import { assertNever } from '@vlight/utils'

import { useMasterDataMaps } from '../hooks/api'
import { memoInProduction } from '../util/development'

import { UniverseWidget } from './universe/universe-widget'
import { ChannelsWidget } from './channels/channels-widget'
import { FixtureWidget } from './fixture/fixture-widget'
import { FixtureGroupWidget } from './fixture-group/fixture-group-widget'
import { MemoryWidget } from './memory/memory-widget'
import { MapWidget } from './map/map-widget'
import { LiveMemoryWidget } from './memory/live-memory-widget'
import { LiveChaseWidget } from './chase/live-chase-widget'

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

      case 'live-memory':
        return (
          <LiveMemoryWidget id={config.id} title={`Live Memory ${config.id}`} />
        )

      case 'live-chase':
        return (
          <LiveChaseWidget id={config.id} title={`Live Chase ${config.id}`} />
        )

      case 'map':
        return <MapWidget />

      default:
        assertNever(config)
        return null
    }
  }
)
