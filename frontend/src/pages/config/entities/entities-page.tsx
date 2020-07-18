import React from 'react'
import { useParams } from 'react-router'
import { EntityName } from '@vlight/entities'
import { css } from 'linaria'

import { memoInProduction } from '../../../util/development'
import { BackArrow } from '../../../ui/components/back-arrow'
import { configPageRoute } from '../../routes'
import { useApiState } from '../../../hooks/api'
import { Icon } from '../../../ui/icons/icon'
import { iconAdd } from '../../../ui/icons'
import { baseline } from '../../../ui/styles'

import { entityUiMapping } from './entity-ui-mapping'
import { EntityList } from './entity-list'
import { openEntityEditor } from './editors'

const headline = css`
  display: flex;
`

const title = css`
  flex: 1 1 auto;
`

const iconSize = 8

const icon = css`
  width: ${baseline(iconSize)};
  height: ${baseline(iconSize)};
`

const EntitiesPage = memoInProduction(() => {
  const { type } = useParams<{ type: EntityName }>()
  const rawMasterData = useApiState('rawMasterData')

  if (!entityUiMapping[type]) return null
  const entries = rawMasterData[type]

  return (
    <div>
      <h1 className={headline}>
        <BackArrow to={configPageRoute} />
        <div className={title}>{entityUiMapping[type].name}</div>
        <Icon
          icon={iconAdd}
          className={icon}
          hoverable
          onClick={() => openEntityEditor(type)}
        />
      </h1>
      <EntityList type={type} entries={entries as any} />
    </div>
  )
})

export default EntitiesPage
