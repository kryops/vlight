import React, { memo, useContext } from 'react'

import { MasterDataContext } from '../../api'

const _TestPage: React.SFC = () => {
  const masterData = useContext(MasterDataContext)

  return (
    <div>
      <h2>Test Page</h2>
      <h3>Master data</h3>
      <pre>{JSON.stringify(masterData, null, 2)}</pre>
    </div>
  )
}

export default memo(_TestPage)
