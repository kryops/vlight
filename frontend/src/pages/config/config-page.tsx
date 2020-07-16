import React from 'react'
import { EntityName } from '@vlight/entities'

import { memoInProduction } from '../../util/development'
import { settingsPageRoute, entitiesPageRoute } from '../routes'
import { TileGrid, Tile } from '../../ui/containers/tiles'
import { iconConfig } from '../../ui/icons'

import { entityUiMapping } from './entities/entity-ui-mapping'

const ConfigPage = memoInProduction(() => {
  return (
    <div>
      <h1>Config</h1>
      <TileGrid>
        <Tile icon={iconConfig} title="Settings" target={settingsPageRoute} />
        {Object.entries(entityUiMapping).map(
          ([type, { name, icon }], index) => (
            <Tile
              key={index}
              title={name}
              icon={icon}
              target={entitiesPageRoute(type as EntityName)}
            />
          )
        )}
      </TileGrid>
    </div>
  )
})

export default ConfigPage
