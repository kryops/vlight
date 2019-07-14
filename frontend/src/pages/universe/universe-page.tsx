import React, { useMemo } from 'react'
import { css } from 'linaria'
import cx from 'classnames'

import {
  useDmxUniverse,
  useMasterData,
  useMasterDataMaps,
} from '../../hooks/api'
import { Bar } from '../../ui/controls/bar'
import { flexEndSpacer } from '../../ui/css/flex-end-spacer'
import { baselinePx } from '../../ui/styles'
import { memoInProduction } from '../../util/development'

import { getFixtureAtChannel, getEffectiveFixtureColor } from './util'

const universePage = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start; /* so the universeBar_connected margins work */

  ${flexEndSpacer}
`

const barSize = baselinePx * 12

const universeBar = css`
  width: ${barSize}px;
  height: ${barSize}px;
  margin: ${baselinePx}px;
`

const universeBar_connected = css`
  margin-right: ${-1.25 * baselinePx}px;
`

const _UniversePage: React.SFC = () => {
  const universe = useDmxUniverse()
  const masterData = useMasterData()
  const { fixtureTypes } = useMasterDataMaps()

  const fixturesAtIndex = useMemo(() => {
    return universe.map((_, index) =>
      getFixtureAtChannel(masterData, index + 1)
    )
  }, [masterData]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className={universePage}>
        {universe.map((value, index) => {
          const fixture = fixturesAtIndex[index]
          const fixtureType = fixture
            ? fixtureTypes.get(fixture.type)
            : undefined

          const isConnected = fixture && fixture === fixturesAtIndex[index + 1]

          const fixtureName =
            fixture && fixtureType && fixture.channel === index + 1
              ? fixture.name || fixtureType.name
              : undefined

          const fixtureColor =
            fixture &&
            fixtureType &&
            getEffectiveFixtureColor(fixture, fixtureType, universe)

          return (
            <Bar
              key={index}
              value={value}
              max={255}
              label={(index + 1).toString()}
              cornerLabel={fixtureName}
              color={fixtureColor}
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

export default memoInProduction(_UniversePage)
