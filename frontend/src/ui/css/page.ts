import { css } from 'linaria'

import { baseline } from '../styles'

import { flexEndSpacer } from './flex-end-spacer'

export const pageWithWidgets = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: stretch;
  margin: -${baseline(1)};
  /* to allow scrolling */
  margin-right: ${baseline(8)};

  ${flexEndSpacer}
`
