import { css } from '@linaria/core'

import { baseline } from '../styles'

import { flexEndSpacerString } from './flex'

/**
 * CSS class for a page containing widgets,
 * creating a flexbox layout and controlling margins.
 */
export const pageWithWidgets = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: stretch;
  margin: -${baseline(1)};
  /* to allow scrolling */
  margin-right: ${baseline(8)};

  ${flexEndSpacerString}
`
