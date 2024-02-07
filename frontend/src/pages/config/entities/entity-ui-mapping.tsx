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
import {
  editEntity,
  removeEntity,
  setLiveChaseState,
  setLiveMemoryState,
} from '../../../api'

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
  transform: none;
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

  /**
   * Callback when an entry is deleted.
   * Executed instead of the default action (`editEntity`).
   */
  onEdit?: (entry: EntityType<T>) => void

  /**
   * Callback when an entry is deleted.
   * Executed instead of the default action (`removeEntity`).
   */
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
    onEdit: async newEntry => {
      const { createGroup, ...fixture } = newEntry
      editEntity('fixtures', fixture)

      if (createGroup) {
        const fixtureIds = new Set(
          apiState.rawMasterData?.fixtures.map(it => it.id)
        )
        const now = Date.now()

        while (
          apiState.rawMasterData?.fixtures.length === fixtureIds.size &&
          Date.now() - now < 2000
        ) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }

        const newFixtureDefinition = apiState.rawMasterData!.fixtures.find(
          it => !fixtureIds.has(it.id)
        )
        if (newFixtureDefinition) {
          editEntity('fixtureGroups', {
            id: '',
            ...entityUiMapping.fixtureGroups?.newEntityFactory?.(),
            name: newFixtureDefinition.name,
            fixtures: [FixtureMappingPrefix.All + newFixtureDefinition.id],
          })
        }
      }
    },
    onDelete: fixture => {
      removeEntity('fixtures', fixture.id)

      replaceMappingInEntities([
        fixture.id,
        FixtureMappingPrefix.All + fixture.id,
        ...(apiState.masterData?.fixtures
          .filter(it => it.originalId === fixture.id)
          .map(it => it.id) ?? []),
      ])
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
      removeEntity('fixtureGroups', group.id)

      const { fixtures } = group
      const groupMappingString = FixtureMappingPrefix.Group + group.id
      replaceMappingInEntities([groupMappingString], fixtures)
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

export function editEntityWithCustomLogic<T extends EntityName>(
  type: T,
  entry: EntityType<T>
) {
  const onEdit = entityUiMapping[type]?.onEdit
  if (onEdit) onEdit(entry)
  else editEntity(type, entry)
}

export function removeEntityWithCustomLogic<T extends EntityName>(
  type: T,
  entry: EntityType<T>
) {
  const onDelete = entityUiMapping[type]?.onDelete
  if (onDelete) onDelete(entry)
  else removeEntity(type, entry.id)
}

function replaceMappingInEntities(
  mappingsToReplace: string[],
  newMappings: string[] = []
): void {
  const overlaps = (originalMappings: string[]) =>
    originalMappings.some(it => mappingsToReplace.includes(it))

  const replaceMappings = (originalMappings: string[]) =>
    overlaps(originalMappings)
      ? originalMappings.flatMap(mappingString =>
          mappingsToReplace.includes(mappingString)
            ? newMappings
            : [mappingString]
        )
      : originalMappings

  const { fixtureGroups, memories } = apiState.rawMasterData!

  for (const group of fixtureGroups) {
    if (overlaps(group.fixtures)) {
      const newFixtures = replaceMappings(group.fixtures)
      if (newFixtures.length) {
        editEntity('fixtureGroups', {
          ...group,
          fixtures: newFixtures,
        })
      } else {
        // If a group has no members left, we delete it, and remove its mappings from entities further down
        removeEntity('fixtureGroups', group.id)
        mappingsToReplace.push(FixtureMappingPrefix.Group + group.id)
      }
    }
  }

  for (const memory of memories) {
    if (memory.scenes.some(scene => overlaps(scene.members))) {
      const newScenes = memory.scenes
        .map(scene => ({
          ...scene,
          members: replaceMappings(scene.members),
        }))
        .filter(scene => scene.members.length)

      if (newScenes.length) {
        editEntity('memories', {
          ...memory,
          scenes: memory.scenes.map(scene => ({
            ...scene,
            members: replaceMappings(scene.members),
          })),
        })
      } else {
        removeEntity('memories', memory.id)
      }
    }
  }

  const { liveChases, liveMemories } = apiState

  const liveEntityUpdates = [
    [liveMemories, setLiveMemoryState],
    [liveChases, setLiveChaseState],
  ] as const
  for (const [entries, updateFn] of liveEntityUpdates) {
    for (const [id, entry] of Object.entries(entries)) {
      if (overlaps(entry.members)) {
        updateFn(id, { members: replaceMappings(entry.members) }, true)
      }
    }
  }
}
