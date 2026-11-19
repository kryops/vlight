import { css } from '@linaria/core'

import { baseline, successShade } from '../styles'

/**
 * CSS class for a container of transparent icon buttons
 * displayed next to a widget's title.
 */
export const widgetTitleControls = css`
  margin: ${baseline(-1.5)};

  > * {
    padding-left: ${baseline(2)};
    padding-right: ${baseline(2)};
  }
`

/**
 * CSS class that draws a ring around a transparent icon button,
 * e.g. to highlight a running chase.
 */
export const activeButton = css`
  position: relative;

  &:after {
    position: absolute;
    top: ${baseline(1)};
    left: ${baseline(1)};
    content: '';
    width: ${baseline(6.5)};
    height: ${baseline(6.5)};
    border-radius: 100%;
    border: 2px solid ${successShade(0)};
    pointer-events: none;
  }
`
