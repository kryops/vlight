import { ComponentType, ReactNode } from 'react'
import { EntityName, EntityType, MasterDataMaps } from '@vlight/types'
import { css } from '@linaria/core'
import { FixtureMappingPrefix, mapFixtureList } from '@vlight/controls'

import {
  iconFixtureType,
  iconLight,
  iconGroup,
  iconMemory,
  iconDynamicPage,
} from '../../../ui/icons'
import { baseline } from '../../../ui/styles'
import { FixtureTypeMapShape } from '../../../widgets/map/map-shape'
import { masterDataMaps } from '../../../api/masterdata'
import { apiState } from '../../../api/api-state'
import { getOccupiedFixtureChannels } from '../../../util/fixtures'
import { editEntity, setLiveChaseState, setLiveMemoryState } from '../../../api'

import { FixtureTypeEditor } from './editors/fixture-type-editor'
import { FixtureEditor } from './editors/fixture-editor'
import { FixtureGroupEditor } from './editors/fixture-group-editor'
import { MemoryEditor } from './editors/memory-editor'
import { DynamicPageEditor } from './editors/dynamic-page-editor'
import {
  newDynamicPageFactory,
  newFixtureFactory,
  newFixtureGroupFactory,
  newFixtureTypeFactory,
  newMemoryFactory,
} from './new-entity-factories'
import { EntityEditorProps } from './types'

const smallInfo = css`
  font-size: 0.75rem;
  padding: 0 ${baseline(2)};
  display: inline-block;
`

const fixtureTypeStyle = css`
  display: inline-block;
  margin-right: ${baseline(2)};
`

export interface EntityEntry<T extends EntityName> {
  /** Entity name to display as headline and on the overview page. */
  name: string

  /** SVG icon path for this entity type. */
  icon: string

  /** Editor component to open in a dialog when clicking on an entry. */
  editor?: ComponentType<EntityEditorProps<T>>

  /** Preview of an entry in the list. Defaults to its name or ID. */
  listPreview?: (
    entity: EntityType<T>,
    masterDataMaps: MasterDataMaps
  ) => ReactNode

  /** Function to create a new entry with default values. */
  newEntityFactory?: () => Omit<EntityType<T>, 'id'>

  /** Callback when an entry is deleted. */
  onDelete?: (entry: EntityType<T>) => void
}

/**
 * Mapping of configurable entity types to their UI representation, editors,
 * and new entry factories.
 */
export const entityUiMapping: { [key in EntityName]?: EntityEntry<key> } = {
  fixtureTypes: {
    name: 'Fixture Types',
    icon: iconFixtureType,
    editor: FixtureTypeEditor,
    newEntityFactory: newFixtureTypeFactory,
    listPreview: entry => (
      <>
        <FixtureTypeMapShape fixtureType={entry} className={fixtureTypeStyle} />
        {entry.name}
        <div className={smallInfo}>{entry.mapping.length} Ch</div>
      </>
    ),
  },
  fixtures: {
    name: 'Fixtures',
    icon: iconLight,
    editor: FixtureEditor,
    newEntityFactory: newFixtureFactory,
    listPreview: (entry, masterDataMaps) => {
      const fixtureTypeName = masterDataMaps.fixtureTypes.get(entry.type)?.name
      const occupiedChannels = getOccupiedFixtureChannels(
        entry,
        masterDataMaps,
        { isRaw: true }
      )
      const maxChannel = Math.max(...occupiedChannels)

      return (
        <>
          {entry.name}
          <div className={smallInfo}>
            Ch {entry.channel}
            {maxChannel !== entry.channel ? ` - ${maxChannel}` : ''}
          </div>
          {entry.count && entry.count >= 2 && (
            <div className={smallInfo}>{entry.count}x</div>
          )}
          {fixtureTypeName && (
            <div className={smallInfo}>{fixtureTypeName}</div>
          )}
        </>
      )
    },
  },
  fixtureGroups: {
    name: 'Fixture Groups',
    icon: iconGroup,
    editor: FixtureGroupEditor,
    newEntityFactory: newFixtureGroupFactory,
    listPreview: entry => (
      <>
        {entry.name}
        <div className={smallInfo}>
          {
            mapFixtureList(entry.fixtures, {
              masterData: apiState.masterData!,
              masterDataMaps,
            }).length
          }{' '}
          Fixtures
        </div>
      </>
    ),
    onDelete: group => {
      // replace group mapping string with fixture strings in chases and memories

      const { fixtures } = group
      const groupMappingString = FixtureMappingPrefix.Group + group.id
      const replaceGroupInMapping = (mapping: string[]) =>
        mapping.includes(groupMappingString)
          ? mapping.flatMap(mappingString =>
              mappingString === groupMappingString ? fixtures : mappingString
            )
          : mapping

      const { memories } = apiState.rawMasterData!

      for (const memory of memories) {
        if (
          memory.scenes.some(
            scene => replaceGroupInMapping(scene.members) !== scene.members
          )
        ) {
          editEntity('memories', {
            ...memory,
            scenes: memory.scenes.map(scene => ({
              ...scene,
              members: replaceGroupInMapping(scene.members),
            })),
          })
        }
      }

      const { liveChases, liveMemories } = apiState

      const liveEntityUpdates = [
        [liveMemories, setLiveMemoryState],
        [liveChases, setLiveChaseState],
      ] as const
      for (const [entries, updateFn] of liveEntityUpdates) {
        for (const [id, entry] of Object.entries(entries)) {
          if (entry.members.includes(groupMappingString)) {
            updateFn(
              id,
              { members: replaceGroupInMapping(entry.members) },
              true
            )
          }
        }
      }
    },
  },
  memories: {
    name: 'Memories',
    icon: iconMemory,
    editor: MemoryEditor,
    newEntityFactory: newMemoryFactory,
  },
  dynamicPages: {
    name: 'Dynamic Pages',
    icon: iconDynamicPage,
    editor: DynamicPageEditor,
    newEntityFactory: newDynamicPageFactory,
  },
}
