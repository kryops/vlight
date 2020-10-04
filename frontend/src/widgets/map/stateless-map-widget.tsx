import { css } from 'linaria'
import React, { CSSProperties } from 'react'
import {
  Fixture,
  FixtureBorderStyle,
  FixtureShape,
  IdType,
} from '@vlight/types'

import { Widget } from '../../ui/containers/widget'
import { memoInProduction } from '../../util/development'
import { baseline, iconShade, primaryShade } from '../../ui/styles'
import { getEffectiveFixtureColor } from '../../util/fixtures'
import { useMasterDataMaps } from '../../hooks/api'
import { cx } from '../../util/styles'
import { useClassNames } from '../../hooks/ui'
import { useSettings } from '../../hooks/settings'

const widget = css`
  position: relative;
  display: inline-block;
  width: 100%;
  min-width: ${baseline(64)};
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
  background: #ccc;
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

  &:hover {
    box-shadow: 0 0 8px #fff;

    &:before {
      content: attr(title);
      position: absolute;
      top: 125%;
      left: -100%;
      width: 300%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      text-shadow: 1px 1px 4px #000;
      z-index: 3;
    }
  }
`

const fixtureStyle_light = css`
  &:hover {
    &:before {
      text-shadow: 1px 1px 4px #fff;
    }
  }
`

const fixture_circle = css`
  border-radius: 100%;
`

export interface MapShape {
  shape: FixtureShape
  border?: FixtureBorderStyle
  x: number
  y: number
  xSize?: number
  ySize?: number
}

export interface StatelessMapWidgetProps {
  fixtures?: Fixture[]
  universe?: number[]
  highlightedFixtures?: IdType[]
  additionalShapes?: MapShape[]
  standalone?: boolean
}

export const StatelessMapWidget = memoInProduction(
  ({
    universe,
    fixtures,
    highlightedFixtures,
    additionalShapes,
    standalone,
  }: StatelessMapWidgetProps) => {
    const { fixtureTypes } = useMasterDataMaps()
    const [widgetClassName, fixtureClassName] = useClassNames(
      [widget, widget_light],
      [fixtureStyle, fixtureStyle_light]
    )
    const { lightMode } = useSettings()

    const positionedFixtures = (fixtures ?? []).filter(
      fixture => fixture.x !== undefined && fixture.y !== undefined
    )

    return (
      <Widget className={cx(widgetClassName, standalone && widget_standalone)}>
        <div className={container}>
          {positionedFixtures.map(fixture => {
            const fixtureType = fixtureTypes.get(fixture.type)
            const color =
              universe &&
              getEffectiveFixtureColor(fixture, fixtureType, universe)
            const isHighlighted = highlightedFixtures?.includes(fixture.id)
            const style: CSSProperties = {
              background: color,
              left: `${fixture.x}%`,
              top: `${fixture.y}%`,
              width: fixtureType?.xSize ? `${fixtureType.xSize}%` : undefined,
              height: fixtureType?.ySize ? `${fixtureType.ySize}%` : undefined,
              borderStyle: fixtureType?.border,
              borderWidth: color || isHighlighted ? '2px' : undefined,
              borderColor: isHighlighted
                ? 'red'
                : color
                ? iconShade(0, lightMode)
                : undefined,
            }
            return (
              <div
                key={fixture.id}
                title={fixture.name}
                style={style}
                className={cx(
                  fixtureClassName,
                  fixtureType?.shape !== 'square' && fixture_circle
                )}
              />
            )
          })}
          {additionalShapes?.map((shape, index) => (
            <div
              key={index}
              style={{
                left: `${shape.x}%`,
                top: `${shape.y}%`,
                width: shape.xSize ? `${shape.xSize}%` : undefined,
                height: shape.ySize ? `${shape.ySize}%` : undefined,
                borderStyle: shape.border,
              }}
              className={cx(
                fixtureClassName,
                shape.shape !== 'square' && fixture_circle
              )}
            />
          ))}
        </div>
      </Widget>
    )
  }
)
