import { ComponentType, ReactNode } from 'react'
import { EntityName, EntityType, MasterDataMaps } from '@vlight/types'
import { css } from '@linaria/core'
import { ChannelType, mapFixtureList } from '@vlight/controls'

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

import { FixtureTypeEditor } from './editors/fixture-type-editor'
import { FixtureEditor } from './editors/fixture-editor'
import { FixtureGroupEditor } from './editors/fixture-group-editor'
import { MemoryEditor } from './editors/memory-editor'
import { DynamicPageEditor } from './editors/dynamic-page-editor'

const smallInfo = css`
  font-size: 0.75rem;
  padding: 0 ${baseline(2)};
  display: inline-block;
`

const fixtureTypeStyle = css`
  display: inline-block;
  margin-right: ${baseline(2)};
`

export interface EntityEditorProps<T extends EntityName> {
  entry: EntityType<T>
  onChange: (entry: EntityType<T>) => void
}

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
}

/**
 * Mapping of all entity types to their UI representation, editors,
 * and new entry factories.
 */
export const entityUiMapping: { [key in EntityName]: EntityEntry<key> } = {
  fixtureTypes: {
    name: 'Fixture Types',
    icon: iconFixtureType,
    editor: FixtureTypeEditor,
    newEntityFactory: () => ({
      name: 'New Fixture Type',
      mapping: [ChannelType.Master],
    }),
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
    newEntityFactory: () => {
      const occupiedChannels =
        apiState.masterData?.fixtures.flatMap(fixture =>
          getOccupiedFixtureChannels(fixture, masterDataMaps)
        ) ?? []
      const occupiedChannelSet = new Set(occupiedChannels)

      const getGap = (channel: number) => {
        for (let i = channel + 1; i <= 512; i++) {
          if (occupiedChannelSet.has(i)) return i - channel - 1
        }
        return 512 - channel
      }
      const largestGapAfterChannel = [0, ...occupiedChannels].sort(
        (a, b) => getGap(b) - getGap(a)
      )[0]

      return {
        name: 'New Fixture',
        type: '',
        channel: largestGapAfterChannel + 1,
      }
    },
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
          {entry.count && entry.count > 2 && (
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
    newEntityFactory: () => ({
      name: 'New Fixture Group',
      fixtures: [],
    }),
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
  },
  memories: {
    name: 'Memories',
    icon: iconMemory,
    editor: MemoryEditor,
    newEntityFactory: () => ({
      name: 'New Memory',
      scenes: [
        {
          members: [],
          states: [
            {
              on: true,
              channels: {
                m: 255,
                r: 255,
                g: 255,
                b: 255,
              },
            },
          ],
        },
      ],
    }),
  },
  dynamicPages: {
    name: 'Dynamic Pages',
    icon: iconDynamicPage,
    editor: DynamicPageEditor,
    newEntityFactory: () => ({
      rows: [
        {
          cells: [
            {
              widgets: [],
            },
          ],
        },
      ],
    }),
  },
}
