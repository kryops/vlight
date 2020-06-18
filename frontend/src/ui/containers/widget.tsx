import { css } from 'linaria'
import React from 'react'
import { mdiPower } from '@mdi/js'

import { Icon } from '../icons/icon'
import {
  baseline,
  primaryShade,
  errorShade,
  successShade,
  backgroundColor,
  baselinePx,
  backgroundColorLight,
} from '../styles'
import { cx } from '../../util/styles'
import { Clickable } from '../helpers/clickable'
import { useSettings } from '../../hooks/settings'

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

const widgetTurnedOff_light = css`
  &::after {
    background: linear-gradient(to top, ${backgroundColorLight}, transparent);
  }
`

const widgetTurnedOn = css`
  border-color: ${primaryShade(0)};
  background: ${primaryShade(3)};
`

const widgetTurnedOn_light = css`
  background: ${primaryShade(4, true)};
`

const widgetIndicator = css`
  display: inline;
  vertical-align: top;
  margin: 0 ${baseline(1)};
`

const bottomLine = css`
  height: ${baseline(0.75)};
  margin-top: ${baseline(-0.75)};
`

export interface WidgetProps {
  title?: string | React.ReactElement
  titleSide?: string | React.ReactElement
  onTitleClick?: () => void
  turnedOn?: boolean
  bottomLineColor?: string
  className?: string
}

export const Widget: React.FC<WidgetProps> = ({
  title,
  titleSide,
  onTitleClick,
  turnedOn,
  bottomLineColor,
  className,
  children,
}) => {
  const { lightMode } = useSettings()
  return (
    <div
      className={cx(
        widget,
        className,
        turnedOn !== undefined && (turnedOn ? widgetTurnedOn : widgetTurnedOff),
        turnedOn === true && lightMode && widgetTurnedOn_light,
        turnedOn === false && lightMode && widgetTurnedOff_light
      )}
    >
      {(title || titleSide) && (
        <div className={cx(section, widgetTitle)}>
          <Clickable onClick={onTitleClick}>
            {title}
            {turnedOn !== undefined && (
              <Icon
                icon={mdiPower}
                color={turnedOn ? successShade(0) : errorShade(0)}
                className={widgetIndicator}
              />
            )}
          </Clickable>
          {titleSide && <div className={titleSideContainer}>{titleSide}</div>}
        </div>
      )}
      <div className={section}>{children}</div>
      {bottomLineColor && (
        <div className={bottomLine} style={{ background: bottomLineColor }} />
      )}
    </div>
  )
}
