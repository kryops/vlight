import { css } from '@linaria/core'
import { PropsWithChildren, ReactElement } from 'react'

import { Icon } from '../icons/icon'
import {
  baseline,
  primaryShade,
  errorShade,
  successShade,
  baselinePx,
  iconShade,
} from '../styles'
import { cx } from '../../util/styles'
import { Clickable } from '../components/clickable'
import { iconOn } from '../icons'
import { ErrorBoundary } from '../../util/error-boundary'
import { HotkeyContext, useHotkey } from '../../hooks/hotkey'

const widget = css`
  flex: 1 1 auto;
  max-width: calc(100% - ${baselinePx * 2}px);
  border: 1px solid ${primaryShade(2)};
  margin: ${baselinePx}px;
`
const section = css`
  display: flex;
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
  opacity: 0.85;
`

const widgetTurnedOn = css`
  border-color: ${primaryShade(0)};
  background: ${primaryShade(3)};
`

const widgetWithHotkeys = css`
  outline-style: dashed;
  outline-color: ${iconShade(0)};
  outline-width: 1px;
`

const widgetIndicator = css`
  margin: ${baseline(-1.5)} ${baseline(1)};
`

const bottomLine = css`
  height: ${baseline(0.75)};
  margin-top: ${baseline(-0.75)};
`

export interface WidgetProps {
  /** SVG path of the icon to display next to the title. */
  icon?: string

  /**
   * Widget title, displayed at the top.
   */
  title?: string | ReactElement

  /**
   * Displayed to the right of the {@link title}.
   */
  titleSide?: string | ReactElement

  onTitleClick?: () => void

  /**
   * Controls whether the widget is currently turned on.
   *
   * - `true`: turned on
   * - `false`: turned off
   * - `undefined`: cannot be turned on or off
   */
  turnedOn?: boolean

  /**
   * Controls whether keyboard hotkeys inside the widget are active.
   */
  hotkeysActive?: boolean

  /**
   * If set, displays a line with the given color to the bottom of the widget.
   */
  bottomLineColor?: string

  className?: string

  /**
   * CSS class name applied to the container that wraps this component's children.
   */
  contentClassName?: string
}

/**
 * Generic widget component.
 */
export function Widget({
  icon,
  title,
  titleSide,
  onTitleClick,
  turnedOn,
  hotkeysActive,
  bottomLineColor,
  className,
  contentClassName,
  children,
}: PropsWithChildren<WidgetProps>) {
  const stateClassName = turnedOn ? widgetTurnedOn : widgetTurnedOff

  useHotkey(
    'Space',
    event => {
      onTitleClick?.()
      event.preventDefault()
    },
    { forceActive: hotkeysActive }
  )

  return (
    <HotkeyContext.Provider value={!!hotkeysActive}>
      <div
        className={cx(
          widget,
          className,
          turnedOn !== undefined && stateClassName,
          hotkeysActive && widgetWithHotkeys
        )}
      >
        {(icon || title || titleSide || turnedOn !== undefined) && (
          <div className={cx(section, widgetTitle)}>
            <div>
              <Clickable onClick={onTitleClick}>
                {icon && (
                  <Icon
                    icon={icon}
                    color={
                      turnedOn
                        ? successShade(0)
                        : turnedOn === false
                        ? errorShade(0)
                        : iconShade(1)
                    }
                    inline
                  />
                )}
                {icon && ' '}
                {title}
                {turnedOn !== undefined && icon === undefined && (
                  <Icon
                    icon={iconOn}
                    color={turnedOn ? successShade(0) : errorShade(0)}
                    className={widgetIndicator}
                    inline
                    padding
                  />
                )}
              </Clickable>
            </div>
            {titleSide && <div className={titleSideContainer}>{titleSide}</div>}
          </div>
        )}
        <div className={cx(section, contentClassName)}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
        {bottomLineColor && (
          <div className={bottomLine} style={{ background: bottomLineColor }} />
        )}
      </div>
    </HotkeyContext.Provider>
  )
}
