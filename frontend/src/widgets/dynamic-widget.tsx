import { WidgetConfig } from '@vlight/types'
import { assertNever, toArray } from '@vlight/utils'

import { useMasterDataMaps } from '../hooks/api'
import { memoInProduction } from '../util/development'
import { WidgetPassthrough } from '../ui/containers/widget'

import { UniverseWidget } from './universe/universe-widget'
import { ChannelsWidget } from './channels/channels-widget'
import { FixtureWidget } from './fixture/fixture-widget'
import { FixtureGroupWidget } from './fixture-group/fixture-group-widget'
import { MemoryWidget } from './memory/memory-widget'
import { MapWidget } from './map/map-widget'
import { LiveMemoryWidget } from './memory/live-memory-widget'
import { LiveChaseWidget } from './chase/live-chase-widget'
import { DmxMasterWidget } from './global/dmx-master-widget'
import { ControlsWidget } from './global/controls-widget'

export interface DynamicWidgetProps extends WidgetPassthrough {
  config: WidgetConfig
}

/**
 * Component that renders a widget based on a dynamic widget configuration.
 */
export const DynamicWidget = memoInProduction(
  ({ config, ...passThrough }: DynamicWidgetProps) => {
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
            {...passThrough}
          />
        )

      case 'channels':
        return (
          <ChannelsWidget
            key={`channels${config.from}-${config.to}-${config.title}`}
            from={config.from}
            to={config.to}
            title={config.title}
            {...passThrough}
          />
        )

      case 'fixture':
        return (
          <>
            {toArray(config.id).map(id => {
              const fixture = fixtures.get(id)
              return fixture ? (
                <FixtureWidget
                  key={`fixture${id}`}
                  fixture={fixture}
                  mapping={config.mapping}
                  {...passThrough}
                />
              ) : null
            })}
          </>
        )

      case 'fixture-group':
        return (
          <>
            {toArray(config.id).map(id => {
              const fixtureGroup = fixtureGroups.get(id)
              return fixtureGroup ? (
                <FixtureGroupWidget
                  key={`fixture-group${id}`}
                  group={fixtureGroup}
                  mapping={config.mapping}
                  {...passThrough}
                />
              ) : null
            })}
          </>
        )

      case 'memory':
        return (
          <>
            {toArray(config.id).map(id => {
              const memory = memories.get(id)
              return memory ? (
                <MemoryWidget
                  key={`memory${id}`}
                  memory={memory}
                  {...passThrough}
                />
              ) : null
            })}
          </>
        )

      case 'live-memory':
        return (
          <>
            {toArray(config.id).map(id => {
              return (
                <LiveMemoryWidget
                  key={`live-memory${id}`}
                  id={id}
                  {...passThrough}
                />
              )
            })}
          </>
        )

      case 'live-chase':
        return (
          <>
            {toArray(config.id).map(id => {
              return (
                <LiveChaseWidget
                  key={`live-chase${id}`}
                  id={id}
                  {...passThrough}
                />
              )
            })}
          </>
        )

      case 'map':
        return <MapWidget />

      case 'dmx-master':
        return <DmxMasterWidget {...passThrough} />

      case 'controls':
        return <ControlsWidget {...passThrough} />

      default:
        assertNever(config)
        return null
    }
  }
)
