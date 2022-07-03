import { memoInProduction } from '../../../util/development'
import { cx } from '../../../util/styles'
import { centeredText, smallText } from '../../css/basic-styles'
import { Icon } from '../../icons/icon'

import { Fader } from './fader'

export interface FaderWithContainerProps {
  /** The current fader value. */
  value: number

  /** Minimum value. Defaults to 0. */
  min?: number

  /** Maximum value. Defaults to 100. */
  max?: number

  /** Step size. If set, rounds the value accordingly. */
  step?: number

  /** Primary label. */
  label?: string

  /** Secondary label displayed below the primary one. */
  subLabel?: string

  /** Label displayed at the bottom of the fader. */
  bottomLabel?: string

  /** Icon displayed at the bottom of the fader. */
  bottomIcon?: string
  onBottomIconClick?: () => any

  className?: string
  faderClassName?: string

  onChange: (value: number) => void
}

/**
 * A fader with an additional label and/or icon at the bottom.
 */
export const FaderWithContainer = memoInProduction(
  ({
    bottomLabel,
    bottomIcon,
    onBottomIconClick,
    className,
    faderClassName,
    ...passThrough
  }: FaderWithContainerProps) => {
    return (
      <div className={cx(centeredText, className)}>
        <Fader {...passThrough} className={faderClassName} />
        {bottomLabel && <div className={smallText}>{bottomLabel}</div>}
        {bottomIcon && (
          <Icon
            icon={bottomIcon}
            hoverable
            inline
            padding
            onClick={onBottomIconClick}
          />
        )}
      </div>
    )
  }
)
