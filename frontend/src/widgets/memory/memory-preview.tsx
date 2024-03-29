import {
  mapFixtureList,
  getFixtureStateForMemoryScene,
  mapFixtureStateToChannels,
  getMemorySceneStateInfo,
} from '@vlight/controls'
import { MasterData, MasterDataMaps, MemoryScene } from '@vlight/types'
import { createZeroArray } from '@vlight/utils'

import { useMasterDataAndMaps } from '../../hooks/api'
import { memoInProduction } from '../../util/development'
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
  const universe = createZeroArray(512)

  for (const scene of scenes) {
    const members = mapFixtureList(scene.members, {
      masterData,
      masterDataMaps,
    })

    const memberFixtures = members.map(
      member => masterDataMaps.fixtures.get(member)!
    )

    const stateInfo = getMemorySceneStateInfo(scene, memberFixtures)

    members.forEach((member, memberIndex) => {
      const fixture = masterDataMaps.fixtures.get(member)
      if (!fixture) return
      const fixtureType = masterDataMaps.fixtureTypes.get(fixture.type)
      if (!fixtureType) return

      const state = getFixtureStateForMemoryScene({
        scene: { ...scene, members },
        memberIndex,
        memberFixtures,
        stateInfo,
      })

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

/**
 * Component to preview the fixture states of a memory on the map.
 */
export const MemoryPreview = memoInProduction(
  ({ scenes, displayFixtureOrder = false, className }: MemoryPreviewProps) => {
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
)
