import { FixtureBorderStyle, FixtureShape, FixtureType } from '@vlight/types'
import { css, cx } from '@linaria/core'
import { CSSProperties, ReactNode, useEffect, useRef, Ref } from 'react'

import { backgroundColor, baselinePx, iconShade } from '../../ui/styles'
import { Touchable } from '../../ui/components/touchable'
import { apiState, apiStateEmitter } from '../../api/api-state'
import { subscribeToUniverse } from '../../api'
import { getEffectiveFixtureColor } from '../../util/fixtures'
import {
  ChannelType,
  getFixtureTypeSegmentLayout,
  getSegmentFixtureType,
} from '@vlight/controls'

const shapeStyle = css`
  border: 1px solid ${iconShade(1)};
  box-sizing: border-box;
  font-size: 0.65rem;
  text-shadow: 1px 1px 2px ${backgroundColor};
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  transform: translate(-50%, -50%);
`

const shapeStyle_circle = css`
  border-radius: 100%;
`

const markerSize = 25 // in percent of the shape

const positionMarkerStyle = css`
  position: absolute;
  left: 0;
  top: 0;
  width: ${`${markerSize}%`};
  height: ${`${markerSize}%`};
  border-radius: 100%;
  background: ${iconShade(1)};
  border: 1px solid ${backgroundColor};
  box-sizing: border-box;
  pointer-events: none;
`

/**
 * Container name of the map widget, for container queries.
 *
 * NOTE: Needs to be inlined in `@container` rules, as interpolations are not supported there.
 */
export const mapContainerName = 'map'

const segmentsContainerStyle = css`
  position: absolute;
  inset: 0;
  pointer-events: none;
`

// Cuts off grid segments at the edges of circle shapes
const segmentsContainerStyle_round = css`
  border-radius: 100%;
  overflow: hidden;
`

const segmentStyle = css`
  position: absolute;
  box-sizing: border-box;
  border: 1px solid ${iconShade(2)};
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  container-type: size;

  /* Borders would obscure the colors on small maps (e.g. the mini map) */
  @container map (max-width: 250px) {
    border: none;
  }
`

// Shrinks the label to fit into small segments
const segmentLabelStyle = css`
  font-size: min(0.65rem, 50cqw, 80cqh);
  line-height: 1;
`

const segmentStyle_round = css`
  border-radius: 100%;
`

const segmentStyle_highlighted = css`
  border-color: red;
`

// Marker moves within this area (in percent of the shape) to stay inside circles
const markerRangeStart = 25
const markerRangeSize = 50

/**
 * Positions the marker center at the given coordinates (in percent of the shape).
 *
 * Performance: Uses `transform` instead of `left`/`top` to avoid layout recalculation.
 * Translate percentages refer to the marker's own size, so we scale accordingly.
 */
function getMarkerTransform(x: number, y: number) {
  const toMarkerPercent = (value: number) => (value * 100) / markerSize - 50
  return `translate(${toMarkerPercent(x)}%, ${toMarkerPercent(y)}%)`
}

export interface MapShapeProps {
  shape?: FixtureShape
  border?: FixtureBorderStyle
  x?: number
  y?: number
  xSize?: number
  ySize?: number
  rotation?: number

  /**
   * Controls whether to highlight the shape.
   *
   * Defaults to `false`.
   */
  highlighted?: boolean

  color?: string

  /** HTML title to be displayed as tooltip. */
  title?: string

  className?: string
  style?: CSSProperties

  /**
   * Controls whether to apply the size as percentage.
   *
   * Defaults to `false`.
   */
  percentages?: boolean

  onDown?: () => void
  onUp?: () => void

  children?: ReactNode

  ref?: Ref<HTMLDivElement>
}

/**
 * Component to display a shape on the map.
 */
export const MapShape = ({
  shape,
  border,
  x,
  y,
  xSize,
  ySize,
  highlighted = false,
  color,
  title,
  className,
  style,
  percentages,
  onDown,
  onUp,
  children,
  rotation,
  ref,
}: MapShapeProps) => {
  const defaultSize = 5

  const finalStyle: CSSProperties = {
    ...style,
    background: color,
    left: x !== undefined ? `${x}%` : undefined,
    top: y !== undefined ? `${y}%` : undefined,
    width: percentages
      ? `${xSize ?? defaultSize}%`
      : baselinePx * (xSize ?? defaultSize),
    height: percentages
      ? `${ySize ?? defaultSize}%`
      : baselinePx * (ySize ?? defaultSize),
    borderStyle: border,
    borderWidth: highlighted ? '2px' : undefined,
    borderColor: highlighted ? 'red' : color ? iconShade(0) : undefined,
    transform: rotation
      ? `translate(-50%, -50%) ${rotation ? `rotate(${rotation}deg)` : ''}`
      : undefined,
  }

  const commonProps = {
    className: cx(
      shapeStyle,
      shape !== 'square' && shapeStyle_circle,
      className
    ),
    style: finalStyle,
    title: title,
    ref,
    'aria-label': title,
  }

  if (onDown || onUp) {
    return (
      <Touchable {...commonProps} role="button" onDown={onDown} onUp={onUp}>
        {children}
      </Touchable>
    )
  }

  return (
    <div role={title ? 'img' : undefined} {...commonProps}>
      {children}
    </div>
  )
}

export type FixtureTypeMapShapeProps = Omit<
  MapShapeProps,
  'shape' | 'border' | 'xSize' | 'ySize'
> & {
  fixtureType: FixtureType
  /** If set, updates the shape to the current state of the DMX universe. */
  channel?: number

  /** Static colors for the fixture type's segments (if it has any). */
  segmentColors?: Array<string | undefined>

  /** Labels to display inside the fixture type's segments (if it has any). */
  segmentLabels?: Array<ReactNode>

  /** Highlights the given segments (0-based indices). */
  highlightedSegments?: number[]

  /**
   * Controls whether to rotate the segments by 180 degrees,
   * e.g. when the map is rotated.
   */
  rotateSegments180?: boolean
}

/**
 * Component to display a shape of a given fixture type on the map.
 */
export function FixtureTypeMapShape({
  fixtureType,
  channel,
  segmentColors,
  segmentLabels,
  highlightedSegments,
  rotateSegments180,
  ...rest
}: FixtureTypeMapShapeProps) {
  const { border, shape, xSize, ySize } = fixtureType
  const elementRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<HTMLDivElement>(null)
  const segmentRefs = useRef<Array<HTMLDivElement | null>>([])
  const segmentLayout = getFixtureTypeSegmentLayout(fixtureType)
  const hasSegments = segmentLayout.length > 0
  const panOffset = fixtureType.mapping.indexOf(ChannelType.Pan)
  const tiltOffset = fixtureType.mapping.indexOf(ChannelType.Tilt)
  const hasPosition = !!channel && panOffset !== -1 && tiltOffset !== -1

  // Performance: We update the fixture colors without React
  useEffect(() => {
    if (!channel) return

    const channelAmount = fixtureType.mapping.length
    const universeIndex = channel - 1
    let lastValues: number[]
    let lastColor: string | null
    const lastSegmentColors: Array<string | null> = []
    const segmentTypes = getFixtureTypeSegmentLayout(fixtureType).map(
      (_, index) => getSegmentFixtureType(fixtureType, index)
    )

    function eventHandler() {
      const currentUniverse = apiState.universe
      if (!currentUniverse || !elementRef.current) return
      const values = currentUniverse.slice(
        universeIndex,
        universeIndex + channelAmount
      )
      if (
        lastValues &&
        lastValues.every((value, index) => values[index] === value)
      )
        return

      lastValues = values

      const marker = markerRef.current
      if (marker && panOffset !== -1 && tiltOffset !== -1) {
        const toPercent = (value = 0) =>
          markerRangeStart + (value / 255) * markerRangeSize
        marker.style.transform = getMarkerTransform(
          toPercent(values[panOffset]),
          toPercent(255 - (values[tiltOffset] ?? 0))
        )
      }

      if (segmentTypes.length) {
        segmentTypes.forEach((segmentType, index) => {
          const segmentElement = segmentRefs.current[index]
          if (!segmentElement) return
          const segmentColor =
            getEffectiveFixtureColor({ channel: 1 }, segmentType, values) ??
            null
          if (segmentColor === lastSegmentColors[index]) return
          segmentElement.style.background = segmentColor ?? 'transparent'
          lastSegmentColors[index] = segmentColor
        })
        return
      }

      const color =
        getEffectiveFixtureColor({ channel: 1 }, fixtureType, values) ?? null
      if (color === lastColor) return
      elementRef.current.style.background = color ?? 'transparent'
      lastColor = color
    }

    apiStateEmitter.on('universe', eventHandler)
    const unsubscribe = subscribeToUniverse()
    eventHandler()

    return () => {
      apiStateEmitter.off('universe', eventHandler)
      unsubscribe()
    }
  }, [fixtureType, channel, panOffset, tiltOffset])

  return (
    <MapShape
      {...rest}
      style={
        // Shapes outside of the map need to be positioned for their segments
        hasSegments && rest.x === undefined && rest.y === undefined
          ? { position: 'relative', ...rest.style }
          : rest.style
      }
      ref={elementRef}
      shape={shape}
      border={border}
      xSize={xSize}
      ySize={ySize}
    >
      {hasSegments && (
        <div
          className={cx(
            segmentsContainerStyle,
            shape !== 'square' && segmentsContainerStyle_round
          )}
          style={
            rotateSegments180 ? { transform: 'rotate(180deg)' } : undefined
          }
        >
          {segmentLayout.map((entry, index) => (
            <div
              key={index}
              ref={element => {
                segmentRefs.current[index] = element
              }}
              className={cx(
                segmentStyle,
                entry.round && segmentStyle_round,
                highlightedSegments?.includes(index) && segmentStyle_highlighted
              )}
              style={{
                left: `${entry.x * 100}%`,
                top: `${entry.y * 100}%`,
                width: `${entry.width * 100}%`,
                height: `${entry.height * 100}%`,
                background: segmentColors?.[index],
                transform: rotateSegments180
                  ? 'translate(-50%, -50%) rotate(180deg)'
                  : undefined,
              }}
            >
              {segmentLabels?.[index] !== undefined && (
                <span className={segmentLabelStyle}>
                  {segmentLabels[index]}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      {rest.children}
      {hasPosition && (
        <div
          ref={markerRef}
          className={positionMarkerStyle}
          style={{ transform: getMarkerTransform(50, 50) }}
        />
      )}
    </MapShape>
  )
}
