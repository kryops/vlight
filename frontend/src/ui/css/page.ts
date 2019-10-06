import { css } from 'linaria'

import { baselinePx } from '../styles'

import { flexEndSpacer } from './flex-end-spacer'

export const pageWithWidgets = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: stretch;
  margin: -${baselinePx}px;
  /* to allow scrolling */
  margin-right: ${baselinePx * 8}px;

  ${flexEndSpacer}
`
