import React from 'react'

import { memoInProduction } from '../../util/development'
import { settingsPageRoute, entitiesPageRoute } from '../routes'
import { TileGrid, Tile } from '../../ui/containers/tiles'
import {
  iconConfig,
  iconFixtureType,
  iconLight,
  iconGroup,
  iconMemory,
  iconDynamicPage,
} from '../../ui/icons'

interface EntityEntry {
  name: string
  icon: string
  target: string
}

const entities: EntityEntry[] = [
  {
    name: 'Fixture types',
    icon: iconFixtureType,
    target: entitiesPageRoute('fixtureTypes'),
  },
  {
    name: 'Fixtures',
    icon: iconLight,
    target: entitiesPageRoute('fixtures'),
  },
  {
    name: 'Fixture Groups',
    icon: iconGroup,
    target: entitiesPageRoute('fixtureGroups'),
  },
  {
    name: 'Memories',
    icon: iconMemory,
    target: entitiesPageRoute('memories'),
  },
  {
    name: 'Dynamic Pages',
    icon: iconDynamicPage,
    target: entitiesPageRoute('dynamicPages'),
  },
]

const ConfigPage = memoInProduction(() => {
  return (
    <div>
      <h1>Config</h1>
      <TileGrid>
        <Tile icon={iconConfig} title="Settings" target={settingsPageRoute} />
        {entities.map(({ name, icon, target }, index) => (
          <Tile key={index} title={name} icon={icon} target={target} />
        ))}
      </TileGrid>
    </div>
  )
})

export default ConfigPage
