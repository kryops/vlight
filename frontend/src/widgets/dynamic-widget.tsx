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

/**
 * Component that renders a widget based on a dynamic widget configuration.
 */
export const DynamicWidget = memoInProduction(
  ({ config }: DynamicWidgetProps) => {
    const { fixtures, fixtureGroups, memories } = useMasterDataMaps()

    // TODO investigate why the keys are needed

    switch (config.type) {
      case 'universe':
        return (
          <UniverseWidget
            key={`universe${config.from}-${config.to}-${config.title}`}
            from={config.from}
            to={config.to}
            title={config.title}
          />
        )

      case 'channels':
        return (
          <ChannelsWidget
            key={`channels${config.from}-${config.to}-${config.title}`}
            from={config.from}
            to={config.to}
            title={config.title}
          />
        )

      case 'fixture':
        const fixture = fixtures.get(config.id)
        return fixture ? (
          <FixtureWidget key={`fixture${config.id}`} fixture={fixture} />
        ) : null

      case 'fixture-group':
        const fixtureGroup = fixtureGroups.get(config.id)
        return fixtureGroup ? (
          <FixtureGroupWidget
            key={`fixture-group${config.id}`}
            group={fixtureGroup}
          />
        ) : null

      case 'memory':
        const memory = memories.get(config.id)
        return memory ? (
          <MemoryWidget key={`memory${config.id}`} memory={memory} />
        ) : null

      case 'live-memory':
        return (
          <LiveMemoryWidget
            key={`live-memory${config.id}`}
            id={config.id}
            title={`Live Memory ${config.id}`}
          />
        )

      case 'live-chase':
        return (
          <LiveChaseWidget
            key={`live-chase${config.id}`}
            id={config.id}
            title={`Live Chase ${config.id}`}
          />
        )

      case 'map':
        return <MapWidget />

      default:
        assertNever(config)
        return null
    }
  }
)
