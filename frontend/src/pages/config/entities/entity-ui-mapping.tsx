import { ComponentType, ReactNode } from 'react'
import { EntityName, EntityType, MasterDataMaps } from '@vlight/types'
import { css } from 'linaria'
import { mapFixtureList } from '@vlight/controls'

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
  name: string
  icon: string
  editor?: ComponentType<EntityEditorProps<T>>
  listPreview?: (
    entity: EntityType<T>,
    masterDataMaps: MasterDataMaps
  ) => ReactNode
  newEntityFactory?: () => Omit<EntityType<T>, 'id'>
}

export const entityUiMapping: { [key in EntityName]: EntityEntry<key> } = {
  fixtureTypes: {
    name: 'Fixture Types',
    icon: iconFixtureType,
    editor: FixtureTypeEditor,
    newEntityFactory: () => ({ name: 'New Fixture Type', mapping: ['m'] }),
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
    newEntityFactory: () => ({
      name: 'New Fixture',
      type: '',
      channel: 1,
    }),
    listPreview: (entry, masterDataMaps) => {
      const fixtureTypeName = masterDataMaps.fixtureTypes.get(entry.type)?.name
      return (
        <>
          {entry.name}
          <div className={smallInfo}>Ch {entry.channel}</div>
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
