import { css } from '@linaria/core'

import { getCssVariableDefinitions } from './styles'

/**
 * Class name for the root element that switches to the light theme.
 *
 * Kept separate from the settings so that the wyw-in-js build-time
 * evaluation does not need to evaluate the settings React context.
 */
export const lightTheme = css`
  ${getCssVariableDefinitions(true)}
`
