import { css } from 'linaria'

export const flexEndSpacer = `
  &::after {
    content: '';
    flex: auto;
    flex-grow: 1000;
  }
`

export const flexAuto = css`
  flex: 1 1 auto;
`

export const flexWrap = css`
  display: flex;
  flex-wrap: wrap;
`
