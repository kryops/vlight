import { css } from 'linaria'
import React, { memo, useContext } from 'react'

import { DmxUniverseContext } from '../../api'
import { Bar } from '../../ui/controls/bar'

const universePage = css`
  display: flex;
  flex-wrap: wrap;
`

const _UniversePage: React.SFC = () => {
  const universe = useContext(DmxUniverseContext)
  if (!universe) {
    return null
  }

  return (
    <>
      <div className={universePage}>
        {universe.map((value, index) => (
          <Bar
            key={index}
            value={value}
            max={255}
            label={(index + 1).toString()}
          />
        ))}
      </div>
    </>
  )
}

export default memo(_UniversePage)
