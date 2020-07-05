import React from 'react'

import { memoInProduction } from '../../../util/development'
import { BackArrow } from '../../../ui/components/back-arrow'
import { configPageRoute } from '../../routes'

const EntitiesPage = memoInProduction(() => {
  return (
    <div>
      <h1>
        <BackArrow to={configPageRoute} />
        Entitiy
      </h1>
      TODO
    </div>
  )
})

export default EntitiesPage
