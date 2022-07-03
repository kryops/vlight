import { css } from '@linaria/core'
import { useMemo } from 'react'
import { MasterData } from '@vlight/types'
import { createRangeArray } from '@vlight/utils'

import { Widget } from '../../ui/containers/widget'
import { memoInProduction } from '../../util/development'
import { cx } from '../../util/styles'
import { flexEndSpacerString, flexWrap } from '../../ui/css/flex'
import { baseline, baselinePx } from '../../ui/styles'
import {
  getFixtureAtChannel,
  getEffectiveFixtureColor,
} from '../../util/fixtures'
import { getUniverseIndex } from '../../api/util'
import { Bar } from '../../ui/controls/bar'
import { useMasterDataMaps } from '../../hooks/api'

const barRows = 3

const container = css`
  justify-content: flex-start; /* so the universeBar_connected margins work */

  ${flexEndSpacerString}
`

const barSizePx = baselinePx * 12

const universeBar = css`
  width: ${barSizePx}px;
  height: ${barSizePx}px;
  margin: ${baseline(1)};
`

const universeBar_connected = css`
  margin-right: ${baseline(-1.25)};
`

export interface StatelessUniverseWidgetProps {
  universe: number[]
  masterData: MasterData
  from: number
  to: number
  title?: string
}

/**
 * Stateless widget to display a part of the DMX universe.
 */
export const StatelessUniverseWidget = memoInProduction(
  ({ universe, masterData, from, to, title }: StatelessUniverseWidgetProps) => {
    const { fixtureTypes } = useMasterDataMaps()
    const fixturesAtIndex = useMemo(() => {
      return universe.map((_, index) =>
        getFixtureAtChannel(masterData, index + 1)
      )
    }, [masterData]) // eslint-disable-line react-hooks/exhaustive-deps
    const range = createRangeArray(from, to)
    // try to wrap it in a few rows to fit in with other widgets
    const maxWidth = Math.round(
      Math.ceil(range.length / barRows) * (barSizePx + 6 * baselinePx)
    )

    return (
      <Widget title={title ?? `Universe ${from} - ${to}`}>
        <div
          className={cx(flexWrap, container)}
          style={{ maxWidth: maxWidth + 'px' }}
        >
          {range.map(channel => {
            const index = getUniverseIndex(channel)
            const value = universe[index]
            const fixture = fixturesAtIndex[index]
            const fixtureType = fixture
              ? fixtureTypes.get(fixture.type)
              : undefined

            const isConnected =
              fixture && fixture === fixturesAtIndex[index + 1]
            const channelOffset = fixture ? index + 1 - fixture.channel : -1
            const channelMapping = fixtureType?.mapping[channelOffset]

            const fixtureName =
              fixture && fixtureType && fixture.channel === index + 1
                ? fixture.name ?? fixtureType.name
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
                color={fixtureColor}
                className={cx(universeBar, {
                  [universeBar_connected]: isConnected,
                })}
              />
            )
          })}
        </div>
      </Widget>
    )
  }
)
