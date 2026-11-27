import { css } from '@linaria/core'
import {
  Fixture,
  FixtureBorderStyle,
  FixtureShape,
  FixtureType,
  IdType,
  MapSettings,
} from '@vlight/types'
import { arrayRange } from '@vlight/utils'
import {
  getFixtureTypeSegments,
  getSegmentFixtureType,
  getSegmentMemberId,
} from '@vlight/controls'
import { useMemo, Ref, CSSProperties } from 'react'

import { backgroundColor, baseline, iconShade } from '../../ui/styles'
import { getEffectiveFixtureColor } from '../../util/fixtures'
import { useMapSettings, useMasterDataMaps } from '../../hooks/api'
import { cx } from '../../util/styles'

import { FixtureTypeMapShape, MapShape, mapContainerName } from './map-shape'
import { fitMapWidth, mapInsetPercent, mapRatioVariable } from './map-size'

// We use separate styles from the standard widget component because this one looks very different
const widget = css`
  flex: 1 1 auto;
  position: relative;
  display: inline-block;
  width: 100%;
  min-width: ${fitMapWidth(baseline(64))};
  max-width: ${fitMapWidth(baseline(96))};
  margin: ${baseline()};
  border: 1px solid ${iconShade(1)};
  overflow: hidden;
  background: ${iconShade(3)};
  container: ${mapContainerName} / inline-size;

  &:before {
    content: '';
    display: block;
    padding-top: calc(100% / var(${mapRatioVariable}, 1));
  }
`

const widget_standalone = css`
  max-width: calc(90vh * var(${mapRatioVariable}, 1));
`

// Percentages refer to the widget's width/height respectively, which retains the aspect ratio
const container = css`
  position: absolute;
  top: ${`${mapInsetPercent}%`};
  left: ${`${mapInsetPercent}%`};
  right: ${`${mapInsetPercent}%`};
  bottom: ${`${mapInsetPercent}%`};
`

const fixtureStyle = css`
  position: absolute;

  /* Name label, only visible on hover or with fixtureStyle_names */
  &:before {
    content: attr(title);
    position: absolute;
    top: 125%;
    left: -100%;
    width: 300%;
    min-width: ${baseline(12)};
    display: none;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    text-shadow: 1px 1px 4px ${backgroundColor};
    pointer-events: none;
    z-index: 3;
  }

  &:hover {
    box-shadow: 0 0 8px ${iconShade(1)};

    &:before {
      display: flex;
    }
  }
`

const fixtureStyle_names = css`
  &:before {
    display: flex;
  }
`

export interface AdditionalMapShape {
  /** If set, the shape is rendered for this fixture type, including its segments. */
  fixtureType?: FixtureType
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
   * The dimensions of the map.
   *
   * Defaults to the project's map settings.
   */
  mapSize?: MapSettings

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

  /**
   * Controls whether to permanently display the names of all fixtures.
   *
   * Defaults to `false`.
   */
  displayNames?: boolean

  /**
   * Controls whether to rotate the map by 180 degrees.
   *
   * Defaults to `false`.
   */
  rotate180?: boolean

  onFixtureDown?: (fixture: Fixture) => void
  onFixtureUp?: (fixture: Fixture) => void

  className?: string

  ref?: Ref<HTMLDivElement>
}

/**
 * Stateless widget to display a map of fixtures or shapes, optionally with a DMX universe state.
 */
export const StatelessMapWidget = ({
  universe,
  fixtures,
  highlightedFixtures,
  additionalShapes,
  mapSize: mapSizeFromProps,
  standalone = false,
  displayChannels = false,
  displayNames = false,
  enableDmxUniverse = false,
  rotate180,
  onFixtureDown,
  onFixtureUp,
  className,
  ref,
}: StatelessMapWidgetProps) => {
  const { fixtureTypes } = useMasterDataMaps()
  const projectMapSize = useMapSettings()
  const mapSize = mapSizeFromProps ?? projectMapSize
  const positionedFixtures = useMemo(
    () =>
      (fixtures ?? []).filter(
        fixture => fixture.x !== undefined && fixture.y !== undefined
      ),
    [fixtures]
  )

  const adjustX = (coord: number) => (rotate180 ? mapSize.width - coord : coord)
  const adjustY = (coord: number) =>
    rotate180 ? mapSize.height - coord : coord

  const style = {
    [mapRatioVariable]: mapSize.width / mapSize.height,
  } as CSSProperties

  return (
    <div
      className={cx(widget, standalone && widget_standalone, className)}
      style={style}
      ref={ref}
    >
      <div className={container}>
        {positionedFixtures.flatMap(fixture => {
          const fixtureType = fixtureTypes.get(fixture.type)
          if (!fixtureType) return null

          const highlightedIndex =
            highlightedFixtures?.indexOf(fixture.id) ?? -1

          const segmentCount = getFixtureTypeSegments(fixtureType)?.count ?? 0
          const segmentIndices = arrayRange(0, segmentCount - 1, it => it)
          const segmentHighlightedIndices = segmentIndices.map(
            index =>
              highlightedFixtures?.indexOf(
                getSegmentMemberId(fixture.id, index + 1)
              ) ?? -1
          )
          const highlightedSegments = segmentIndices.filter(
            index => segmentHighlightedIndices[index] !== -1
          )
          const highlighted =
            highlightedIndex !== -1 || highlightedSegments.length > 0

          const displayHighlightOrder =
            highlightedFixtures?.length !== undefined &&
            highlightedFixtures.length > 1 &&
            displayChannels !== 'highlighted'

          const segmentColors =
            universe && segmentCount
              ? segmentIndices.map(index =>
                  getEffectiveFixtureColor(
                    fixture,
                    getSegmentFixtureType(fixtureType, index),
                    universe
                  )
                )
              : undefined

          const segmentLabels =
            displayHighlightOrder && highlightedSegments.length
              ? segmentHighlightedIndices.map(index =>
                  index === -1 ? undefined : index + 1
                )
              : undefined

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
                    ? adjustX(fixture.x + offset * (fixture.xOffset ?? 8))
                    : undefined
                }
                y={
                  fixture.y !== undefined
                    ? adjustY(fixture.y + offset * (fixture.yOffset ?? 0))
                    : undefined
                }
                color={
                  universe && !segmentCount
                    ? getEffectiveFixtureColor(fixture, fixtureType, universe)
                    : undefined
                }
                segmentColors={segmentColors}
                segmentLabels={segmentLabels}
                highlightedSegments={highlightedSegments}
                rotateSegments180={rotate180}
                channel={enableDmxUniverse ? fixture.channel : undefined}
                highlighted={highlighted}
                title={fixture.name}
                className={cx(fixtureStyle, displayNames && fixtureStyle_names)}
                percentages
                mapSize={mapSize}
                onDown={
                  onFixtureDown ? () => onFixtureDown(fixture) : undefined
                }
                onUp={onFixtureUp ? () => onFixtureUp(fixture) : undefined}
                rotation={fixture.rotation}
              >
                {highlightedIndex !== -1 &&
                  displayHighlightOrder &&
                  highlightedIndex + 1}
                {(displayChannels === true ||
                  (displayChannels === 'highlighted' && highlighted)) &&
                  fixture.channel}
              </FixtureTypeMapShape>
            )
          })
        })}
        {additionalShapes?.map(({ fixtureType, ...shape }, index) =>
          fixtureType ? (
            <FixtureTypeMapShape
              key={index}
              fixtureType={fixtureType}
              x={adjustX(shape.x)}
              y={adjustY(shape.y)}
              className={fixtureStyle}
              percentages
              mapSize={mapSize}
            />
          ) : (
            <MapShape
              key={index}
              {...shape}
              x={adjustX(shape.x)}
              y={adjustY(shape.y)}
              className={fixtureStyle}
              percentages
              mapSize={mapSize}
            />
          )
        )}
      </div>
    </div>
  )
}
