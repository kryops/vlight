import { useMemo } from 'react'
import { css } from '@linaria/core'

import { useDmxUniverse, useMasterDataAndMaps } from '../../hooks/api'
import { Bar } from '../../ui/controls/bar'
import { pageWithWidgets } from '../../ui/css/page'
import { baseline } from '../../ui/styles'
import { memoInProduction } from '../../util/development'
import { cx } from '../../util/styles'
import {
  getFixtureAtChannel,
  getEffectiveFixtureColor,
} from '../../util/fixtures'

const universePage = css`
  justify-content: flex-start; /* so the universeBar_connected margins work */
`

const barSize = baseline(12)

const universeBar = css`
  width: ${barSize};
  height: ${barSize};
  margin: ${baseline(1)};
`

const universeBar_connected = css`
  margin-right: ${baseline(-1.25)};
`

/**
 * Displays the current state of the DMX universe as channel bars.
 */
const UniversePage = memoInProduction(() => {
  const universe = useDmxUniverse()
  const { masterData, masterDataMaps } = useMasterDataAndMaps()
  const { fixtureTypes } = masterDataMaps

  const fixturesAtIndex = useMemo(() => {
    return universe.map((_, index) =>
      getFixtureAtChannel(masterData, index + 1)
    )
  }, [masterData]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <h1>Universe</h1>
      <div className={cx(pageWithWidgets, universePage)}>
        {universe.map((value, index) => {
          const fixture = fixturesAtIndex[index]
          const fixtureType = fixture
            ? fixtureTypes.get(fixture.type)
            : undefined

          const isConnected = fixture && fixture === fixturesAtIndex[index + 1]
          const channelOffset = fixture ? index + 1 - fixture.channel : -1
          const channelMapping = fixtureType?.mapping[channelOffset]

          const fixtureName =
            fixture && fixtureType && fixture.channel === index + 1
              ? (fixture.name ?? fixtureType.name)
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
              topCornerLabel={channelMapping?.toUpperCase()}
              bottomCornerLabel={fixtureName}
              bottomCornerLabelOverflow={
                fixtureType ? fixtureType.mapping.length > 1 : false
              }
              color={fixtureColor}
              className={cx(universeBar, isConnected && universeBar_connected)}
            />
          )
        })}
      </div>
    </>
  )
})

export default UniversePage
