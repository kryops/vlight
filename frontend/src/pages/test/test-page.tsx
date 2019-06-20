import React from 'react'

import { useMasterData } from '../../hooks/api'
import { memoInProduction } from '../../util/development'
import { DynamicWidget } from '../../widgets/dynamic'

const _TestPage: React.SFC = () => {
  const masterData = useMasterData()

  return (
    <div>
      <h2>Test Page</h2>
      <h3>Widgets</h3>
      <DynamicWidget config={{ type: 'fixture', id: 'rgb' }} />
      <DynamicWidget config={{ type: 'fixture-group', id: 'multi' }} />
      <h3>Master data</h3>
      <pre>{JSON.stringify(masterData, null, 2)}</pre>
    </div>
  )
}

export default memoInProduction(_TestPage)
