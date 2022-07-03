import { css } from '@linaria/core'

/** Linear animation that constantly rotates its target. */
export const rotateAnimation = css`
  animation: rotate 0.5s linear infinite;

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
`
