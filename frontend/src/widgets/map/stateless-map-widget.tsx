import { css } from '@linaria/core'
import {
  Fixture,
  FixtureBorderStyle,
  FixtureShape,
  IdType,
} from '@vlight/types'
import { arrayRange } from '@vlight/utils'
import { forwardRef, useMemo } from 'react'

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
      min-width: ${baseline(12)};
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

  /**
   * An explicit DMX universe.
   *
   * If you want to display the state of the global DMX universe,
   * prefer {@link enableDmxUniverse} instead.
   */
  universe?: number[]

  /**
   * Controls whether the fixture shapes will update themselves
   * to the state of the current DMX universe, circumventing React
   * for performance.
   */
  enableDmxUniverse?: boolean

  highlightedFixtures?: IdType[]
  additionalShapes?: AdditionalMapShape[]

  /**
   * Controls whether to display the widget as stand-alone,
   * increasing its width.
   *
   * Defaults to `false`.
   */
  standalone?: boolean

  /**
   * Controls whether to display the channels on the fixtures.
   *
   * Defaults to `false`.
   */
  displayChannels?: boolean | 'highlighted'

  onFixtureDown?: (fixture: Fixture) => void
  onFixtureUp?: (fixture: Fixture) => void

  className?: string
}

/**
 * Stateless widget to display a map of fixtures or shapes, optionally with a DMX universe state.
 */
export const StatelessMapWidget = memoInProduction(
  forwardRef<HTMLDivElement, StatelessMapWidgetProps>(
    (
      {
        universe,
        fixtures,
        highlightedFixtures,
        additionalShapes,
        standalone = false,
        displayChannels = false,
        enableDmxUniverse = false,
        onFixtureDown,
        onFixtureUp,
        className,
      },
      ref
    ) => {
      const { fixtureTypes } = useMasterDataMaps()
      const positionedFixtures = useMemo(
        () =>
          (fixtures ?? []).filter(
            fixture => fixture.x !== undefined && fixture.y !== undefined
          ),
        [fixtures]
      )

      return (
        <div
          className={cx(widget, standalone && widget_standalone, className)}
          ref={ref}
        >
          <div className={container}>
            {positionedFixtures.flatMap(fixture => {
              const fixtureType = fixtureTypes.get(fixture.type)
              if (!fixtureType) return null

              const highlightedIndex =
                highlightedFixtures?.indexOf(fixture.id) ?? -1
              const highlighted = highlightedIndex !== -1

              return arrayRange(
                1,
                fixture.fixturesSharingChannel ?? 1,
                it => it - 1
              ).map(offset => {
                return (
                  <FixtureTypeMapShape
                    key={fixture.id + '_' + offset}
                    fixtureType={fixtureType}
                    x={
                      fixture.x !== undefined
                        ? fixture.x + offset * (fixture.xOffset ?? 8)
                        : undefined
                    }
                    y={
                      fixture.y !== undefined
                        ? fixture.y + offset * (fixture.yOffset ?? 0)
                        : undefined
                    }
                    color={
                      universe &&
                      getEffectiveFixtureColor(fixture, fixtureType, universe)
                    }
                    channel={enableDmxUniverse ? fixture.channel : undefined}
                    highlighted={highlighted}
                    title={fixture.name}
                    className={fixtureStyle}
                    percentages
                    onDown={
                      onFixtureDown ? () => onFixtureDown(fixture) : undefined
                    }
                    onUp={onFixtureUp ? () => onFixtureUp(fixture) : undefined}
                  >
                    {highlighted &&
                      highlightedFixtures?.length !== undefined &&
                      highlightedFixtures?.length > 1 &&
                      displayChannels !== 'highlighted' &&
                      highlightedIndex + 1}
                    {(displayChannels === true ||
                      (displayChannels === 'highlighted' && highlighted)) &&
                      fixture.channel}
                  </FixtureTypeMapShape>
                )
              })
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
)
