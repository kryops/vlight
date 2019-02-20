import React, { memo, useContext } from 'react'

import { DmxUniverseContext } from '../../api'

const _UniversePage: React.SFC = () => {
  const universe = useContext(DmxUniverseContext)
  if (!universe) {
    return null
  }

  return (
    <>
      <div>DMX Universe: {JSON.stringify(universe!.slice(0, 50))}</div>
    </>
  )
}

export default memo(_UniversePage)
