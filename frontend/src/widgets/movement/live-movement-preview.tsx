import { css } from '@linaria/core'
import {
  getLiveMovementFixtures,
  getLiveMovementMemberPhase,
  getLiveMovementMemberRotation,
  getLiveMovementPosition,
} from '@vlight/controls'
import { LiveMovement, LiveMovementPosition } from '@vlight/types'
import { ensureBetween } from '@vlight/utils'
import { useRef } from 'react'

import { useMasterDataAndMaps } from '../../hooks/api'
import { useDelayedState } from '../../hooks/delayed-state'
import { Touchable } from '../../ui/components/touchable'
import { backgroundColor, iconShade, primaryShade } from '../../ui/styles'
import { cx } from '../../util/styles'
import { getTouchEventOffset } from '../../util/touch'

const pathResolution = 200

/** Margin around the 0-255 range in the SVG's coordinate system. */
const viewBoxMargin = 6
const viewBoxSize = 255 + 2 * viewBoxMargin

const borderWidth = 2

const container = css`
  flex: 0 0 auto;
  border: ${borderWidth}px solid ${iconShade(2)};
  background: ${backgroundColor};
`

const container_interactive = css`
  cursor: crosshair;

  &:hover {
    border-color: ${iconShade(1)};
  }
`

const svg = css`
  display: block;
  pointer-events: none;
`

export interface LiveMovementPreviewProps {
  movement: LiveMovement
  /** Outer size in px, including the border. */
  size: number
  className?: string
  title?: string

  /** If set, the center can be changed by touching/dragging inside the preview. */
  onCenterChange?: (center: LiveMovementPosition) => void
}

/**
 * Draws the path of a live movement within the pan/tilt range,
 * including the center and the start positions of all members.
 *
 * Optionally allows changing the center by touching/dragging.
 */
export const LiveMovementPreview = ({
  movement,
  size,
  className,
  title,
  onCenterChange,
}: LiveMovementPreviewProps) => {
  const masterDataWithMaps = useMasterDataAndMaps()
  const touchRef = useRef<HTMLDivElement>(null)

  // We apply the changed center locally while dragging to prevent flickering
  const [localCenter, setLocalCenter] =
    useDelayedState<LiveMovementPosition | null>(null)
  const lastCenterRef = useRef<LiveMovementPosition | null>(null)

  const center = localCenter ?? movement.center
  const displayedMovement = localCenter
    ? { ...movement, center: localCenter }
    : movement

  const fixtures = getLiveMovementFixtures(movement, masterDataWithMaps)

  // tilt is drawn from bottom to top, like in the position picker
  const toPoint = ({ pan, tilt }: LiveMovementPosition) =>
    [pan, 255 - tilt] as const

  const getPathPoints = (rotation: number) =>
    Array.from({ length: pathResolution + 1 }, (_, index) =>
      toPoint(
        getLiveMovementPosition(
          displayedMovement,
          index / pathResolution,
          rotation
        )
      )
        .map(it => it.toFixed(1))
        .join(',')
    ).join(' ')

  // With a rotation offset, each member moves along its own path.
  // The first member's path is drawn on top.
  const pathRotations = movement.rotationOffset
    ? Array.from({ length: Math.max(fixtures.length, 1) }, (_, index) =>
        getLiveMovementMemberRotation(movement, index)
      ).reverse()
    : [movement.rotation]

  const [centerX, centerY] = toPoint(center)

  const content = (
    <svg
      className={svg}
      width={size - 2 * borderWidth}
      height={size - 2 * borderWidth}
      viewBox={`${-viewBoxMargin} ${-viewBoxMargin} ${viewBoxSize} ${viewBoxSize}`}
    >
      {pathRotations.map((rotation, index) => {
        const isFirstMember = index === pathRotations.length - 1
        return (
          <polyline
            key={index}
            points={getPathPoints(rotation)}
            fill="none"
            stroke={iconShade(isFirstMember ? 1 : 2)}
            strokeWidth={isFirstMember ? 3 : 2}
            strokeLinejoin="round"
          />
        )
      })}
      {fixtures.map((fixture, index) => {
        const [x, y] = toPoint(
          getLiveMovementPosition(
            displayedMovement,
            getLiveMovementMemberPhase(movement, 0, index, fixtures.length),
            getLiveMovementMemberRotation(movement, index)
          )
        )
        return (
          <circle
            key={fixture.id}
            cx={x}
            cy={y}
            r={index === 0 ? 10 : 7}
            fill={primaryShade(0)}
            opacity={index === 0 ? 0.9 : 0.6}
          />
        )
      })}
      <circle
        cx={centerX}
        cy={centerY}
        r={12}
        fill="none"
        stroke={iconShade(0)}
        strokeWidth={3}
      />
      <line
        x1={centerX - 18}
        x2={centerX + 18}
        y1={centerY}
        y2={centerY}
        stroke={iconShade(0)}
        strokeWidth={3}
      />
      <line
        x1={centerX}
        x2={centerX}
        y1={centerY - 18}
        y2={centerY + 18}
        stroke={iconShade(0)}
        strokeWidth={3}
      />
    </svg>
  )

  if (!onCenterChange) {
    return (
      <div className={cx(container, className)} title={title}>
        {content}
      </div>
    )
  }

  return (
    <Touchable
      ref={touchRef}
      className={cx(container, container_interactive, className)}
      title={title}
      onTouch={event => {
        const offset = getTouchEventOffset(event, touchRef)
        if (!offset) return

        // the offset contains the container's border
        const toValue = (px: number, total: number) =>
          Math.round(
            ensureBetween(
              ((px - borderWidth) / (total - 2 * borderWidth)) * viewBoxSize -
                viewBoxMargin,
              0,
              255
            )
          )
        const newCenter: LiveMovementPosition = {
          pan: toValue(offset.x, offset.width),
          tilt: 255 - toValue(offset.y, offset.height),
        }

        const lastCenter = lastCenterRef.current
        if (
          lastCenter?.pan === newCenter.pan &&
          lastCenter?.tilt === newCenter.tilt
        ) {
          return
        }
        lastCenterRef.current = newCenter
        setLocalCenter(newCenter)
        onCenterChange(newCenter)
      }}
      onUp={() => {
        lastCenterRef.current = null
        setLocalCenter(null, true)
      }}
      preventScroll
    >
      {content}
    </Touchable>
  )
}
