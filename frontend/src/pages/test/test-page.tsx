import React, { memo } from 'react'

import { useMasterData } from '../../hooks/api'

const _TestPage: React.SFC = () => {
  const masterData = useMasterData()

  return (
    <div>
      <h2>Test Page</h2>
      <h3>Master data</h3>
      <pre>{JSON.stringify(masterData, null, 2)}</pre>
    </div>
  )
}

export default memo(_TestPage)
