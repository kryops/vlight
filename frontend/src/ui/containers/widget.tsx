import { css } from 'linaria'
import React from 'react'

import { baselinePx, primaryShade } from '../styles'
import { cx } from '../../util/styles'

const widgetMargin = baselinePx

const widget = css`
  flex: 1 1 auto;
  max-width: calc(100% - ${widgetMargin * 2}px);
  border: 1px solid ${primaryShade(2)};
  margin: ${widgetMargin}px;
`
const section = css`
  padding: ${baselinePx * 2}px;
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
