import { FixtureBorderStyle, FixtureShape, FixtureType } from '@vlight/types'
import { css, cx } from '@linaria/core'
import { CSSProperties, forwardRef, ReactNode, useEffect, useRef } from 'react'

import { backgroundColor, baselinePx, iconShade } from '../../ui/styles'
import { Touchable } from '../../ui/components/touchable'
import { apiState, apiStateEmitter } from '../../api/api-state'
import { getEffectiveFixtureColor } from '../../util/fixtures'

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
}

/**
 * Component to display a shape on the map.
 */
export const MapShape = forwardRef<HTMLDivElement, MapShapeProps>(
  (
    {
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
    },
    ref
  ) => {
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
    }

    if (onDown || onUp) {
      return (
        <Touchable {...commonProps} onDown={onDown} onUp={onUp}>
          {children}
        </Touchable>
      )
    }

    return <div {...commonProps}>{children}</div>
  }
)

export type FixtureTypeMapShapeProps = Omit<
  MapShapeProps,
  'shape' | 'border' | 'xSize' | 'ySize'
> & {
  fixtureType: FixtureType
  /** If set, updates the shape to the current state of the DMX universe. */
  channel?: number
}

/**
 * Component to display a shape of a given fixture type on the map.
 */
export function FixtureTypeMapShape({
  fixtureType,
  channel,
  ...rest
}: FixtureTypeMapShapeProps) {
  const { border, shape, xSize, ySize } = fixtureType
  const elementRef = useRef<HTMLDivElement>(null)

  // Performance: We update the fixture colors without React
  useEffect(() => {
    if (!channel) return

    const channelAmount = fixtureType.mapping.length
    const universeIndex = channel - 1
    let lastValues: number[]
    let lastColor: string | null

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
      const color =
        getEffectiveFixtureColor({ channel: 1 }, fixtureType, values) ?? null
      if (color === lastColor) return
      elementRef.current.style.background = color ?? 'transparent'
      lastColor = color
    }

    apiStateEmitter.on('universe', eventHandler)
    eventHandler()

    return () => {
      apiStateEmitter.off('universe', eventHandler)
    }
  }, [fixtureType, channel])

  return (
    <MapShape
      {...rest}
      ref={elementRef}
      shape={shape}
      border={border}
      xSize={xSize}
      ySize={ySize}
    />
  )
}
