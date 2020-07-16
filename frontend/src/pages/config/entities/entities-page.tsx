import React from 'react'
import { useParams } from 'react-router'
import { EntityName } from '@vlight/entities'

import { memoInProduction } from '../../../util/development'
import { BackArrow } from '../../../ui/components/back-arrow'
import { configPageRoute } from '../../routes'
import { useMasterData } from '../../../hooks/api'

import { entityUiMapping } from './entity-ui-mapping'
import { EntityList } from './entity-list'

const EntitiesPage = memoInProduction(() => {
  const { type } = useParams<{ type: EntityName }>()
  const masterData = useMasterData()

  if (!entityUiMapping[type]) return null

  const title = entityUiMapping[type].name
  const entries = masterData[type]

  return (
    <div>
      <h1>
        <BackArrow to={configPageRoute} />
        {title}
      </h1>
      <EntityList type={type} entries={entries as any} />
    </div>
  )
})

export default EntitiesPage
