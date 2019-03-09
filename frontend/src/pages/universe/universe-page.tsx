import { css } from 'linaria'
import React, { memo } from 'react'

import { useDmxUniverse } from '../../hooks/api'
import { Bar } from '../../ui/controls/bar'
import { baselinePx } from '../../ui/styles'

const universePage = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  &::after {
    content: '';
    flex: auto;
  }
`

const barSize = baselinePx * 12

const universeBar = css`
  width: ${barSize}px;
  height: ${barSize}px;
  margin: ${baselinePx}px;
`

const _UniversePage: React.SFC = () => {
  const universe = useDmxUniverse()

  return (
    <>
      <div className={universePage}>
        {universe.map((value, index) => (
          <Bar
            key={index}
            value={value}
            max={255}
            label={(index + 1).toString()}
            className={universeBar}
          />
        ))}
      </div>
    </>
  )
}

export default memo(_UniversePage)
