import { css } from '@linaria/core'

import { centeredText } from './basic-styles'

/**
 * CSS class for editor titles that removes the top margin.
 */
export const editorTitle = css`
  margin-top: 0;
`

/**
 * CSS class for preview columns in editors.
 */
export const editorPreviewColumn = centeredText

/**
 * CSS class that sets the width to auto.
 */
export const autoWidthInput = css`
  width: auto;
`
