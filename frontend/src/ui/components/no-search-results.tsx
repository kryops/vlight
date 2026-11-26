import { css } from '@linaria/core'

const hint = css`
  opacity: 0.6;
  font-style: italic;
`

/** Hint to display when a search does not match anything. */
export function NoSearchResults() {
  return <p className={hint}>No matches</p>
}
