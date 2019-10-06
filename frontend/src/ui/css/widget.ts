import { css } from 'linaria'

export const widgetTitle = css`
  display: flex;

  & > :first-child {
    flex-grow: 1;
  }
`

export const widgetTurnedOff = css`
  & > * {
    opacity: 0.75;
  }
`
