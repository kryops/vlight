import { css } from 'linaria'
import React from 'react'

import { baseline, baselinePx, primaryShade } from '../styles'
import { cx } from '../../util/styles'

const widgetMarginPx = baselinePx

const widget = css`
  flex: 1 1 auto;
  max-width: calc(100% - ${widgetMarginPx * 2}px);
  border: 1px solid ${primaryShade(2)};
  margin: ${widgetMarginPx}px;
`
const section = css`
  padding: ${baseline(2)};
`

export interface WidgetProps {
  title?: string | React.ReactElement
  className?: string
}

export const Widget: React.FunctionComponent<WidgetProps> = ({
  title,
  className,
  children,
}) => (
  <div className={cx(widget, className)}>
    <div className={section}>{title}</div>
    <div className={section}>{children}</div>
  </div>
)
