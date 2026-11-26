import {
  getFixtureStateForMemoryScene,
  getMemorySceneStateInfo,
  getMemberFixture,
  mapFixtureMemberList,
  writeFixtureStatesToUniverse,
} from '@vlight/controls'
import {
  Dictionary,
  FixtureState,
  MasterData,
  MasterDataMaps,
  MemoryScene,
} from '@vlight/types'
import { createZeroArray, isTruthy } from '@vlight/utils'

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
  const universe = createZeroArray(512)

  for (const scene of scenes) {
    const members = mapFixtureMemberList(scene.members, {
      masterData,
      masterDataMaps,
    }).filter(member => getMemberFixture(member, masterDataMaps))

    const memberFixtures = members
      .map(member => getMemberFixture(member, masterDataMaps))
      .filter(isTruthy)

    const stateInfo = getMemorySceneStateInfo(scene, memberFixtures)

    const fixtureStates: Dictionary<FixtureState> = {}
    members.forEach((member, memberIndex) => {
      fixtureStates[member] = getFixtureStateForMemoryScene({
        scene: { ...scene, members },
        memberIndex,
        memberFixtures,
        stateInfo,
      })
    })

    writeFixtureStatesToUniverse(universe, fixtureStates, masterDataMaps)
  }

  return universe
}

/**
 * Component to preview the fixture states of a memory on the map.
 */
export const MemoryPreview = ({
  scenes,
  displayFixtureOrder = false,
  className,
}: MemoryPreviewProps) => {
  const { masterData, masterDataMaps } = useMasterDataAndMaps()

  const universe = getMemoryUniverse(scenes, masterData, masterDataMaps)

  return (
    <StatelessMapWidget
      fixtures={masterData.fixtures}
      universe={universe}
      className={className}
      highlightedFixtures={
        displayFixtureOrder && scenes.length === 1
          ? mapFixtureMemberList(scenes[0].members, {
              masterData,
              masterDataMaps,
            })
          : undefined
      }
    />
  )
}
