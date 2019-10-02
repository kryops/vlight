import cx from 'classnames'
import { css } from 'linaria'
import React, { useMemo } from 'react'
import { MasterData } from '@vlight/entities'

import { Widget } from '../../ui/containers/widget'
import { memoInProduction } from '../../util/development'
import { createRangeArray } from '../../util/array'
import { flexEndSpacer } from '../../ui/css/flex-end-spacer'
import { baselinePx } from '../../ui/styles'
import {
  getFixtureAtChannel,
  getEffectiveFixtureColor,
} from '../../pages/universe/util'
import { getUniverseIndex } from '../../api/util'
import { Bar } from '../../ui/controls/bar'
import { useMasterDataMaps } from '../../hooks/api'

const barRows = 3

const container = css`
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

export interface StatelessUniverseWidgetProps {
  universe: number[]
  masterData: MasterData
  from: number
  to: number
  title?: string
}

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
      Math.ceil(range.length / barRows) * (barSize + 6 * baselinePx)
    )

    return (
      <Widget title={title ?? `Universe ${from} - ${to}`}>
        <div className={container} style={{ maxWidth: maxWidth + 'px' }}>
          {range.map(channel => {
            const index = getUniverseIndex(channel)
            const value = universe[index]
            const fixture = fixturesAtIndex[index]
            const fixtureType = fixture
              ? fixtureTypes.get(fixture.type)
              : undefined

            const isConnected =
              fixture && fixture === fixturesAtIndex[index + 1]

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
                cornerLabel={fixtureName}
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
