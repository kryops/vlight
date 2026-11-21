import { css } from '@linaria/core'
import { ProgrammableButton } from '@vlight/types'

import { pressButton, releaseButton } from '../../api'
import { useApiStateEntry } from '../../hooks/api'
import { Button } from '../../ui/buttons/button'
import { Icon } from '../../ui/icons/icon'
import { baseline } from '../../ui/styles'
import { cx } from '../../util/styles'

const buttonStyle = css`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${baseline()};
  box-sizing: border-box;
  height: ${baseline(20)};
  min-width: ${baseline(24)};
  max-width: ${baseline(36)};
  margin: 0;
  padding: ${baseline(2)};
  overflow: hidden;
  line-height: 1.2;
  user-select: none;
`

const labelStyle = css`
  max-width: 100%;
  min-width: 0;
  overflow-wrap: anywhere;
  hyphens: auto;
`

const label_small = css`
  font-size: 0.75rem;
`

const label_tiny = css`
  font-size: 0.65rem;
`

/** Labels longer than this are displayed in a smaller font. */
const smallLabelThreshold = 10

/** Labels longer than this are displayed in an even smaller font. */
const tinyLabelThreshold = 20

export interface ProgrammableButtonControlProps {
  button: ProgrammableButton

  className?: string
}

/**
 * Displays a programmable button that executes its actions when pressed and released.
 */
export const ProgrammableButtonControl = ({
  button,
  className,
}: ProgrammableButtonControlProps) => {
  const { id, label, icon, mode = 'flash' } = button
  const active = useApiStateEntry('buttons', id) ?? false

  const onDown = () => pressButton(id)
  // releasing has no effect in toggle mode
  const onUp = mode === 'flash' ? () => releaseButton(id) : undefined

  const labelLength = label?.length ?? 0

  return (
    <Button
      className={cx(buttonStyle, className)}
      onDown={onDown}
      onUp={onUp}
      active={active || undefined}
      title={label}
    >
      {icon && <Icon icon={icon} size={label ? 6 : 10} />}
      {label && (
        <span
          className={cx(
            labelStyle,
            labelLength > tinyLabelThreshold
              ? label_tiny
              : labelLength > smallLabelThreshold && label_small
          )}
        >
          {label}
        </span>
      )}
      {!icon && !label && <span>{id}</span>}
    </Button>
  )
}
