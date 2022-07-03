import { css } from '@linaria/core'

import { baseline } from '../styles'

/**
 * CSS class that defines a scrollable container around multiple faders.
 */
export const faderContainer = css`
  display: flex;
  align-items: stretch;
  overflow-x: auto;
  max-width: 100%;
  /* horizontal scrolling */
  padding-bottom: ${baseline(8)};

  /* justify-content: center does not work with overflow */
  & > :first-child {
    margin-left: auto;
  }
  & > :last-child {
    margin-right: auto;
  }
`
