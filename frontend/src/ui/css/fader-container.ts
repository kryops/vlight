import { css } from 'linaria'

import { baselinePx } from '../styles'

export const faderContainer = css`
  display: flex;
  align-items: stretch;
  overflow-x: auto;
  max-width: 100%;
  /* horizontal scrolling */
  padding-bottom: ${baselinePx * 8}px;

  /* justify-content: center does not work with overflow */
  & > :first-child {
    margin-left: auto;
  }
  & > :last-child {
    margin-right: auto;
  }
`
