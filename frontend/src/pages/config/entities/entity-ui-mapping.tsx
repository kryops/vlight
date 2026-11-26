import { ComponentType, ReactNode } from 'react'
import { EntityName, EntityType, IdType, MasterDataMaps } from '@vlight/types'
import { css } from '@linaria/core'
import {
  FixtureMappingPrefix,
  mapFixtureList,
  parseSegmentMemberId,
  splitSegmentsPrefix,
  toggleFixtureMappingSegments,
} from '@vlight/controls'

import {
  iconFixtureType,
  iconLight,
  iconGroup,
  iconMemory,
  iconDynamicPage,
  iconButton,
  iconSequence,
  iconAction,
} from '../../../ui/icons'
import { baseline, errorShade } from '../../../ui/styles'
import { cx } from '../../../util/styles'
import { FixtureTypeMapShape } from '../../../widgets/map/map-shape'
import { Icon } from '../../../ui/icons/icon'
import { getMasterDataMaps } from '../../../api/masterdata'
import { apiState } from '../../../api/api-state'
import {
  formatChannelList,
  getOccupiedFixtureChannels,
  getOverlappingFixtureChannels,
} from '../../../util/fixtures'
import {
  editEntity,
  removeEntity,
  setLiveChaseState,
  setLiveMovementState,
  setLiveMemoryState,
} from '../../../api'

import { FixtureTypeEditor } from './editors/fixture-type-editor'
import { FixtureEditor } from './editors/fixture-editor'
import { FixtureGroupEditor } from './editors/fixture-group-editor'
import { MemoryEditor } from './editors/memory-editor'
import { DynamicPageEditor } from './editors/dynamic-page-editor'
import { ButtonEditor } from './editors/button-editor'
import { SequenceEditor } from './editors/sequence-editor'
import { NamedActionEditor } from './editors/named-action-editor'
import { actionTypeNames } from './editors/actions/action-utils'
import {
  newDynamicPageFactory,
  newFixtureFactory,
  newFixtureGroupFactory,
  newFixtureTypeFactory,
  newMemoryFactory,
  newButtonFactory,
  newSequenceFactory,
  newNamedActionFactory,
} from './new-entity-factories'
import { EntityEditorProps } from './types'
import {
  removeIdsFromAction,
  removeReferencesFromActions,
  updateActions,
} from './action-references'

const smallInfo = css`
  font-size: 0.75rem;
  padding: 0 ${baseline(2)};
  display: inline-block;
`

const overlapInfo = css`
  color: ${errorShade(0)};
`

const buttonIconStyle = css`
  margin-right: ${baseline(2)};
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
      const overlappingChannels = apiState.masterData
        ? getOverlappingFixtureChannels(
            entry,
            apiState.masterData,
            masterDataMaps
          )
        : []

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
          {overlappingChannels.length > 0 && (
            <div
              className={cx(smallInfo, overlapInfo)}
              title="Channels overlapping with other fixtures"
            >
              Overlap: Ch {formatChannelList(overlappingChannels)}
            </div>
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
              masterDataMaps: getMasterDataMaps(),
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
    onDelete: memory => {
      removeEntity('memories', memory.id)
      removeReferencesFromActions('memory', memory.id)
    },
  },
  sequences: {
    name: 'Sequences',
    icon: iconSequence,
    editor: SequenceEditor,
    newEntityFactory: newSequenceFactory,
    listPreview: entry => (
      <>
        {entry.name ?? entry.id}
        <div className={smallInfo}>{entry.steps.length} Steps</div>
        <div className={smallInfo}>
          {entry.steps.reduce((sum, step) => sum + step.actions.length, 0)}{' '}
          Actions
        </div>
      </>
    ),
    onDelete: sequence => {
      removeEntity('sequences', sequence.id)
      removeReferencesFromActions('sequence', sequence.id)
    },
  },
  actions: {
    name: 'Actions',
    icon: iconAction,
    editor: NamedActionEditor,
    newEntityFactory: newNamedActionFactory,
    listPreview: entry => (
      <>
        {entry.name ?? entry.id}
        <div className={smallInfo}>{actionTypeNames[entry.type]}</div>
      </>
    ),
    onDelete: action => {
      // remove the references first, so editing the action itself
      // (if it references itself) does not interfere with its removal
      removeReferencesFromActions('action', action.id)
      removeEntity('actions', action.id)
    },
  },
  buttons: {
    name: 'Buttons',
    icon: iconButton,
    editor: ButtonEditor,
    newEntityFactory: newButtonFactory,
    listPreview: (entry, masterDataMaps) => {
      const icon = masterDataMaps.buttons.get(entry.id)?.icon
      return (
        <>
          {icon && <Icon icon={icon} inline className={buttonIconStyle} />}
          {entry.label ?? entry.id}
          <div className={smallInfo}>
            {entry.down.length + entry.up.length} Actions
          </div>
        </>
      )
    },
    onDelete: button => {
      // remove the references first, so editing the button itself
      // (if it references itself) does not interfere with its removal
      removeReferencesFromActions('button', button.id)
      removeEntity('buttons', button.id)
    },
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
  // Ignores the `segments:` prefix, and maps segment IDs to their fixture
  const getBaseMapping = (mappingString: string) => {
    const { base } = splitSegmentsPrefix(mappingString)
    const segmentMember = parseSegmentMemberId(base)
    return segmentMember && mappingsToReplace.includes(segmentMember.fixtureId)
      ? segmentMember.fixtureId
      : base
  }

  const shouldReplace = (mappingString: string) =>
    mappingsToReplace.includes(getBaseMapping(mappingString))

  const overlaps = (originalMappings: string[]) =>
    originalMappings.some(shouldReplace)

  const replaceMappings = (originalMappings: string[]) =>
    overlaps(originalMappings)
      ? originalMappings.flatMap(mappingString => {
          if (!shouldReplace(mappingString)) return [mappingString]
          const { segments, base } = splitSegmentsPrefix(mappingString)
          // single segments of a removed fixture cannot be replaced
          if (getBaseMapping(mappingString) !== base) return []
          return segments
            ? newMappings.map(it => toggleFixtureMappingSegments(it, true))
            : newMappings
        })
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

  const removedMemoryIds: IdType[] = []

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
        removedMemoryIds.push(memory.id)
      }
    }
  }

  // Buttons, sequences, and named actions: replace fixture mappings, and remove deleted groups and memories
  // (in a single update, as separate updates would overwrite each other)
  const removedGroupIds = mappingsToReplace
    .filter(it => it.startsWith(FixtureMappingPrefix.Group))
    .map(it => it.slice(FixtureMappingPrefix.Group.length))
  const removeGroups = removeIdsFromAction('fixture-group', removedGroupIds)
  const removeMemories = removeIdsFromAction('memory', removedMemoryIds)

  updateActions(action => {
    if (action.type === 'fixture-group') return removeGroups(action)
    if (action.type === 'memory') return removeMemories(action)
    if (action.type !== 'fixture' || !overlaps(action.members ?? [])) {
      return action
    }
    const members = replaceMappings(action.members)
    // actions without members are removed
    return members.length ? { ...action, members } : null
  })

  const { liveChases, liveMemories, liveMovements } = apiState

  const liveEntityUpdates = [
    [liveMemories, setLiveMemoryState],
    [liveChases, setLiveChaseState],
    [liveMovements, setLiveMovementState],
  ] as const
  for (const [entries, updateFn] of liveEntityUpdates) {
    for (const [id, entry] of Object.entries(entries)) {
      if (overlaps(entry.members)) {
        updateFn(id, { members: replaceMappings(entry.members) }, true)
      }
    }
  }
}
