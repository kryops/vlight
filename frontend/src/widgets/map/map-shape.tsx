import { FixtureBorderStyle, FixtureShape, FixtureType } from '@vlight/types'
import { css, cx } from '@linaria/core'
import { CSSProperties, ReactNode } from 'react'

import { backgroundColor, baselinePx, iconShade } from '../../ui/styles'
import { Touchable } from '../../ui/components/touchable'

const shapeStyle = css`
  border: 1px solid ${iconShade(1)};
  box-sizing: border-box;
  font-size: 0.65rem;
  text-shadow: 1px 1px 2px ${backgroundColor};
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
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
export function MapShape({
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
}: MapShapeProps) {
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
  }

  const commonProps = {
    className: cx(
      shapeStyle,
      shape !== 'square' && shapeStyle_circle,
      className
    ),
    style: finalStyle,
    title: title,
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

export type FixtureTypeMapShapeProps = Omit<
  MapShapeProps,
  'shape' | 'border' | 'xSize' | 'ySize'
> & {
  fixtureType: FixtureType
}

/**
 * Component to display a shape of a given fixture type on the map.
 */
export function FixtureTypeMapShape({
  fixtureType,
  ...rest
}: FixtureTypeMapShapeProps) {
  const { border, shape, xSize, ySize } = fixtureType
  return (
    <MapShape
      {...rest}
      shape={shape}
      border={border}
      xSize={xSize}
      ySize={ySize}
    />
  )
}
