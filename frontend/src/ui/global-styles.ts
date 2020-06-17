import { css } from 'linaria'

import { backgroundColor, fontSizePx, textShade } from './styles'

export const globalStyles = css`
  :global() {
    html,
    body {
      height: 100%;
      background: ${backgroundColor};
      color: ${textShade(0)};
      margin: 0;
      padding: 0;
      font-size: ${fontSizePx}px;
      font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI',
        Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;

      /* remove 300ms click delay */
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }

    a {
      cursor: pointer;
      color: ${textShade(0)};
      text-decoration: none;
    }

    #root {
      height: 100%;
    }
  }
`
