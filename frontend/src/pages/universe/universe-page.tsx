import React, { memo, useMemo } from 'react'
import { css } from 'linaria'
import cx from 'classnames'

import { useDmxUniverse, useMasterData } from '../../hooks/api'
import { Bar } from '../../ui/controls/bar'
import { flexEndSpacer } from '../../ui/css/flex-end-spacer'
import { baselinePx } from '../../ui/styles'

import { getFixtureAtChannel } from './util'

const universePage = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  ${flexEndSpacer}
`

const barSize = baselinePx * 12

const universeBar = css`
  width: ${barSize}px;
  height: ${barSize}px;
  margin: ${baselinePx}px;
`

const universeBar_connected = css`
  margin-right: ${-2 * baselinePx}px;
`

const _UniversePage: React.SFC = () => {
  const universe = useDmxUniverse()
  const masterData = useMasterData()

  const fixturesAtIndex = useMemo(() => {
    return universe.map((_, index) =>
      getFixtureAtChannel(masterData, index + 1)
    )
  }, [masterData]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className={universePage}>
        {universe.map((value, index) => {
          const isConnected =
            index < fixturesAtIndex.length - 1 &&
            fixturesAtIndex[index] &&
            fixturesAtIndex[index] === fixturesAtIndex[index + 1]
          return (
            <Bar
              key={index}
              value={value}
              max={255}
              label={(index + 1).toString()}
              className={cx(universeBar, {
                [universeBar_connected]: isConnected,
              })}
            />
          )
        })}
      </div>
    </>
  )
}

export default memo(_UniversePage)
