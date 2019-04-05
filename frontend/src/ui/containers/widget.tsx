import cx from 'classnames'
import { css } from 'linaria'
import React from 'react'

import { baselinePx, primaryShade } from '../styles'

const widgetMargin = baselinePx

const widget = css`
  flex: 1 1 auto;
  max-width: calc(100% - ${widgetMargin * 2}px);
  border: 1px solid ${primaryShade(2)};
  margin: ${widgetMargin}px;
`
const headline = css`
  padding: ${baselinePx * 2}px;
`

const content = css`
  padding: ${baselinePx * 2}px;
`

export interface Props {
  title?: string | React.ReactElement
  className?: string
}

export const Widget: React.SFC<Props> = ({ title, className, children }) => (
  <div className={cx(widget, className)}>
    <div className={headline}>{title}</div>
    <div className={content}>{children}</div>
  </div>
)
