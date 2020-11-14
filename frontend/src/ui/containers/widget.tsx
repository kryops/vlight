import { css } from 'linaria'
import { PropsWithChildren, ReactElement } from 'react'

import { Icon } from '../icons/icon'
import {
  baseline,
  primaryShade,
  errorShade,
  successShade,
  baselinePx,
  backgroundColor,
} from '../styles'
import { cx } from '../../util/styles'
import { Clickable } from '../components/clickable'
import { iconOn } from '../icons'

const widget = css`
  flex: 1 1 auto;
  max-width: calc(100% - ${baselinePx * 2}px);
  border: 1px solid ${primaryShade(2)};
  margin: ${baselinePx}px;
`
const section = css`
  padding: ${baseline(2)};
`

const widgetTitle = css`
  display: flex;

  & > :first-child {
    flex-grow: 1;
  }
`

const titleSideContainer = css`
  margin-left: ${baseline(2)};
`

const widgetTurnedOff = css`
  position: relative;
  border-style: dotted;
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to top, ${backgroundColor}, transparent);
    opacity: 0.9;
    pointer-events: none;
    z-index: 3;
  }
`

const widgetTurnedOn = css`
  border-color: ${primaryShade(0)};
  background: ${primaryShade(3)};
`

const widgetIndicator = css`
  margin: 0 ${baseline(1)};
`

const bottomLine = css`
  height: ${baseline(0.75)};
  margin-top: ${baseline(-0.75)};
`

export interface WidgetProps {
  title?: string | ReactElement
  titleSide?: string | ReactElement
  onTitleClick?: () => void
  turnedOn?: boolean
  bottomLineColor?: string
  className?: string
  contentClassName?: string
}

export function Widget({
  title,
  titleSide,
  onTitleClick,
  turnedOn,
  bottomLineColor,
  className,
  contentClassName,
  children,
}: PropsWithChildren<WidgetProps>) {
  const stateClassName = turnedOn ? widgetTurnedOn : widgetTurnedOff

  return (
    <div
      className={cx(
        widget,
        className,
        turnedOn !== undefined && stateClassName
      )}
    >
      {(title || titleSide || turnedOn !== undefined) && (
        <div className={cx(section, widgetTitle)}>
          <Clickable onClick={onTitleClick}>
            {title}
            {turnedOn !== undefined && (
              <Icon
                icon={iconOn}
                color={turnedOn ? successShade(0) : errorShade(0)}
                className={widgetIndicator}
                inline
              />
            )}
          </Clickable>
          {titleSide && <div className={titleSideContainer}>{titleSide}</div>}
        </div>
      )}
      <div className={cx(section, contentClassName)}>{children}</div>
      {bottomLineColor && (
        <div className={bottomLine} style={{ background: bottomLineColor }} />
      )}
    </div>
  )
}
