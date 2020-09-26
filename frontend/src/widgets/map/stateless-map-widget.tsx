import { css } from 'linaria'
import React, { CSSProperties } from 'react'
import { Fixture } from '@vlight/entities'

import { Widget } from '../../ui/containers/widget'
import { memoInProduction } from '../../util/development'
import { baseline, iconShade, primaryShade } from '../../ui/styles'
import { getEffectiveFixtureColor } from '../../util/fixtures'
import { useMasterDataMaps } from '../../hooks/api'
import { cx } from '../../util/styles'
import { useClassName } from '../../hooks/ui'
import { useSettings } from '../../hooks/settings'

const widget = css`
  position: relative;
  display: inline-block;
  width: 100%;
  max-width: ${baseline(96)};
  border: 1px solid ${iconShade(1)};
  overflow: hidden;
  background: ${primaryShade(3)};

  :before {
    content: '';
    display: block;
    padding-top: 100%; /* initial ratio of 1:1*/
  }
`

const widget_light = css`
  border: 1px solid ${iconShade(0, true)};
  background: #eee;
`

const widget_standalone = css`
  max-width: 90vh;
`

const container = css`
  position: absolute;
  top: 1%;
  left: 1%;
  right: 5%;
  bottom: 5%;
`

const fixtureStyle = css`
  position: absolute;
  border: 1px solid ${iconShade(1)};
  height: 5%;
  width: 5%;
  box-sizing: border-box;
`

const fixture_circle = css`
  border-radius: 100%;
`

export interface StatelessMapWidgetProps {
  universe: number[]
  fixtures: Fixture[]
  standalone?: boolean
}

export const StatelessMapWidget = memoInProduction(
  ({ universe, fixtures, standalone }: StatelessMapWidgetProps) => {
    const { fixtureTypes } = useMasterDataMaps()
    const widgetClassName = useClassName(widget, widget_light)
    const { lightMode } = useSettings()

    const positionedFixtures = fixtures.filter(
      fixture => fixture.x !== undefined && fixture.y !== undefined
    )

    return (
      <Widget className={cx(widgetClassName, standalone && widget_standalone)}>
        <div className={container}>
          {positionedFixtures.map(fixture => {
            const fixtureType = fixtureTypes.get(fixture.type)
            const color = getEffectiveFixtureColor(
              fixture,
              fixtureType,
              universe
            )
            const style: CSSProperties = {
              background: color,
              left: `${fixture.x}%`,
              top: `${fixture.y}%`,
              borderWidth: color ? '2px' : '1px',
              borderColor: color
                ? iconShade(0, lightMode)
                : iconShade(1, lightMode),
            }
            if (fixtureType?.xSize) style.width = `${fixtureType.xSize}%`
            if (fixtureType?.ySize) style.height = `${fixtureType.ySize}%`
            return (
              <div
                key={fixture.id}
                title={fixture.name}
                style={style}
                className={cx(
                  fixtureStyle,
                  fixtureType?.shape !== 'square' && fixture_circle
                )}
              />
            )
          })}
        </div>
      </Widget>
    )
  }
)
