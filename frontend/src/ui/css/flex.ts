import { css } from '@linaria/core'

/**
 * CSS string (not a class!) to add a spacer at the end of the flexbox,
 * preventing content from stretching in the last row.
 */
export const flexEndSpacerString = `
  &::after {
    content: '';
    flex: auto;
    flex-grow: 1000;
  }
`

/**
 * CSS class to grow/shrink the element in a flex container.
 */
export const flexAuto = css`
  flex: 1 1 auto;
`

/**
 * CSS class to wrap elements in a flex container.
 */
export const flexWrap = css`
  display: flex;
  flex-wrap: wrap;
`

/**
 * CSS class to create a flex container.
 */
export const flexContainer = css`
  display: flex;
`

/**
 * CSS class to create a vertical flex container.
 */
export const verticalFlexContainer = css`
  display: flex;
  flex-direction: column;
`
