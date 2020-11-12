import { FixtureBorderStyle, FixtureShape, FixtureType } from '@vlight/types'
import { css, cx } from 'linaria'
import { CSSProperties, ReactNode } from 'react'

import { baselinePx, iconShade } from '../../ui/styles'

const shapeStyle = css`
  border: 1px solid ${iconShade(1)};
  box-sizing: border-box;
  font-size: 0.65rem;
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
  highlighted?: boolean
  color?: string
  title?: string
  className?: string
  style?: CSSProperties
  percentages?: boolean
  children?: ReactNode
}

export function MapShape({
  shape,
  border,
  x,
  y,
  xSize,
  ySize,
  highlighted,
  color,
  title,
  className,
  style,
  percentages,
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

  return (
    <div
      className={cx(
        shapeStyle,
        shape !== 'square' && shapeStyle_circle,
        className
      )}
      style={finalStyle}
      title={title}
    >
      {children}
    </div>
  )
}

export type FixtureTypeMapShapeProps = Omit<
  MapShapeProps,
  'shape' | 'border' | 'xSize' | 'ySize'
> & {
  fixtureType: FixtureType
}

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
