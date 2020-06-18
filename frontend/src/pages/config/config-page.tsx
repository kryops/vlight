import React from 'react'

import { memoInProduction } from '../../util/development'
import { settingsPageRoute } from '../routes'
import { TileGrid, Tile } from '../../ui/containers/tiles'
import { iconConfig } from '../../ui/icons'

const ConfigPage = memoInProduction(() => {
  return (
    <div>
      <h1>Config</h1>
      <TileGrid>
        <Tile icon={iconConfig} title="Settings" target={settingsPageRoute} />
      </TileGrid>
    </div>
  )
})

export default ConfigPage
