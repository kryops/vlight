import {
  mapFixtureList,
  getFixtureStateForMemoryScene,
  mapFixtureStateToChannels,
} from '@vlight/controls'
import { MasterData, MasterDataMaps, MemoryScene } from '@vlight/types'

import { useMasterDataAndMaps } from '../../hooks/api'
import { StatelessMapWidget } from '../map/stateless-map-widget'

export interface MemoryPreviewProps {
  scenes: MemoryScene[]
  /**
   * Displays the order of fixtures if the memory has a single scene.
   *
   * Defaults to `false`.
   */
  displayFixtureOrder?: boolean
  className?: string
}

function getMemoryUniverse(
  scenes: MemoryScene[],
  masterData: MasterData,
  masterDataMaps: MasterDataMaps
): number[] {
  const universe = new Array(512).fill(0)

  for (const scene of scenes) {
    const members = mapFixtureList(scene.members, {
      masterData,
      masterDataMaps,
    })

    members.forEach((member, memberIndex) => {
      const fixture = masterDataMaps.fixtures.get(member)
      if (!fixture) return
      const fixtureType = masterDataMaps.fixtureTypes.get(fixture.type)
      if (!fixtureType) return

      const state = getFixtureStateForMemoryScene(
        { ...scene, members },
        memberIndex
      )

      mapFixtureStateToChannels(fixtureType, state).forEach((value, offset) => {
        const universeIndex = fixture.channel - 1 + offset
        if (universe[universeIndex] < value) {
          universe[universeIndex] = value
        }
      })
    })
  }

  return universe
}

export function MemoryPreview({
  scenes,
  displayFixtureOrder = false,
  className,
}: MemoryPreviewProps) {
  const { masterData, masterDataMaps } = useMasterDataAndMaps()

  const universe = getMemoryUniverse(scenes, masterData, masterDataMaps)

  return (
    <StatelessMapWidget
      fixtures={masterData.fixtures}
      universe={universe}
      className={className}
      highlightedFixtures={
        displayFixtureOrder && scenes.length === 1
          ? mapFixtureList(scenes[0].members, { masterData, masterDataMaps })
          : undefined
      }
    />
  )
}
