import { css } from '@linaria/core'
import { IdType, ProgrammableButton } from '@vlight/types'
import { useContext } from 'react'

import { pressButton, releaseButton } from '../../api'
import { useApiStateEntry } from '../../hooks/api'
import { HotkeyContext, PageHotkeyContext, useHotkey } from '../../hooks/hotkey'
import { Button } from '../../ui/buttons/button'
import { Icon } from '../../ui/icons/icon'
import { baseline, primaryShade } from '../../ui/styles'
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

/** Distinguishes toggle buttons from flash buttons. */
const button_toggle = css`
  border: 1px solid ${primaryShade(1)};
`

/** The active background has the same color as the regular border. */
const button_toggle_active = css`
  border-color: ${primaryShade(0)};
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

/**
 * Keyboard events already handled per button.
 *
 * Prevents executing the actions multiple times if the same button
 * is displayed more than once on a page.
 */
const handledHotkeyEvents = new WeakMap<KeyboardEvent, Set<IdType>>()

function isHotkeyEventHandled(event: KeyboardEvent, id: IdType): boolean {
  let ids = handledHotkeyEvents.get(event)
  if (!ids) {
    ids = new Set()
    handledHotkeyEvents.set(event, ids)
  }
  if (ids.has(id)) return true
  ids.add(id)
  return false
}

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
  const { id, label, icon, hotkey, mode = 'flash' } = button
  const active = useApiStateEntry('buttons', id) ?? false

  // active if the surrounding widget is selected, or if no widget is selected at all
  const widgetHotkeysActive = useContext(HotkeyContext)
  const pageHotkeysActive = useContext(PageHotkeyContext)

  const onDown = () => pressButton(id)
  // releasing has no effect in toggle mode
  const onUp = mode === 'flash' ? () => releaseButton(id) : undefined

  const hotkeyEnabled = useHotkey(
    hotkey || undefined,
    event => {
      if (event.repeat || isHotkeyEventHandled(event, id)) return
      if (event.type === 'keyup') {
        onUp?.()
      } else {
        onDown()
      }
    },
    { keyup: true, forceActive: widgetHotkeysActive || pageHotkeysActive }
  )

  const hotkeyLabel = hotkeyEnabled ? `(${hotkey!.toUpperCase()})` : undefined
  const title = [label, hotkeyLabel].filter(Boolean).join(' ') || undefined

  const labelLength = label?.length ?? 0

  return (
    <Button
      className={cx(
        buttonStyle,
        mode === 'toggle' && button_toggle,
        mode === 'toggle' && active && button_toggle_active,
        className
      )}
      onDown={onDown}
      onUp={onUp}
      active={active || undefined}
      title={title}
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
