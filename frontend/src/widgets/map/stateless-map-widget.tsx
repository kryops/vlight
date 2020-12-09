import { css } from '@linaria/core'
import {
  Fixture,
  FixtureBorderStyle,
  FixtureShape,
  IdType,
} from '@vlight/types'

import { memoInProduction } from '../../util/development'
import { backgroundColor, baseline, iconShade } from '../../ui/styles'
import { getEffectiveFixtureColor } from '../../util/fixtures'
import { useMasterDataMaps } from '../../hooks/api'
import { cx } from '../../util/styles'

import { FixtureTypeMapShape, MapShape } from './map-shape'

// We use separate styles from the standard widget component because this one looks very different
const widget = css`
  flex: 1 1 auto;
  position: relative;
  display: inline-block;
  width: 100%;
  min-width: ${baseline(64)};
  max-width: ${baseline(96)};
  margin: ${baseline()};
  border: 1px solid ${iconShade(1)};
  overflow: hidden;
  background: ${iconShade(3)};

  :before {
    content: '';
    display: block;
    padding-top: 100%; /* initial ratio of 1:1*/
  }
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

  &:hover {
    box-shadow: 0 0 8px ${iconShade(1)};

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
      text-shadow: 1px 1px 4px ${backgroundColor};
      z-index: 3;
    }
  }
`

export interface AdditionalMapShape {
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
  additionalShapes?: AdditionalMapShape[]
  standalone?: boolean
  className?: string
}

export const StatelessMapWidget = memoInProduction(
  ({
    universe,
    fixtures,
    highlightedFixtures,
    additionalShapes,
    standalone,
    className,
  }: StatelessMapWidgetProps) => {
    const { fixtureTypes } = useMasterDataMaps()
    const positionedFixtures = (fixtures ?? []).filter(
      fixture => fixture.x !== undefined && fixture.y !== undefined
    )

    return (
      <div className={cx(widget, standalone && widget_standalone, className)}>
        <div className={container}>
          {positionedFixtures.map(fixture => {
            const fixtureType = fixtureTypes.get(fixture.type)
            if (!fixtureType) return null

            const highlightedIndex =
              highlightedFixtures?.indexOf(fixture.id) ?? -1
            const highlighted = highlightedIndex !== -1

            return (
              <FixtureTypeMapShape
                key={fixture.id}
                fixtureType={fixtureType}
                x={fixture.x}
                y={fixture.y}
                color={
                  universe &&
                  getEffectiveFixtureColor(fixture, fixtureType, universe)
                }
                highlighted={highlighted}
                title={fixture.name}
                className={fixtureStyle}
                percentages
              >
                {highlighted && highlightedIndex + 1}
              </FixtureTypeMapShape>
            )
          })}
          {additionalShapes?.map((shape, index) => (
            <MapShape
              key={index}
              {...shape}
              className={fixtureStyle}
              percentages
            />
          ))}
        </div>
      </div>
    )
  }
)
