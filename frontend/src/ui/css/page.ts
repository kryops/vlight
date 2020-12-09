import { css } from '@linaria/core'

import { baseline } from '../styles'

import { flexEndSpacer } from './flex'

export const pageWithWidgets = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: stretch;
  margin: -${baseline(1)};
  /* to allow scrolling */
  margin-right: ${baseline(8)};

  ${flexEndSpacer}
`
