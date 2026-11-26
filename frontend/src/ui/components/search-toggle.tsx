import { css } from '@linaria/core'
import { useRef, useState } from 'react'

import { useHotkey } from '../../hooks/hotkey'
import { SearchState } from '../../hooks/search'
import { Button } from '../buttons/button'
import { Input } from '../forms/input'
import { iconClose, iconSearch } from '../icons'
import { Icon } from '../icons/icon'
import { baseline } from '../styles'

const container = css`
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  margin-right: ${baseline()};
`

const input = css`
  width: ${baseline(40)};
`

export type SearchToggleProps = Pick<SearchState, 'query' | 'setQuery'>

/**
 * Search icon button that turns into a text input when clicked.
 *
 * The input stays visible as long as a query is set.
 * Can be opened with Ctrl+F; Escape clears and closes it.
 */
export function SearchToggle({ query, setQuery }: SearchToggleProps) {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const close = () => {
    setQuery('')
    setOpen(false)
  }

  useHotkey(
    'mod+f',
    event => {
      event.preventDefault()
      setOpen(true)
      inputRef.current?.focus()
    },
    { forceActive: true }
  )

  if (!open && !query) {
    return (
      <Button
        icon={iconSearch}
        title="Search (Ctrl+F)"
        ariaLabel="Search"
        transparent
        onClick={() => setOpen(true)}
      />
    )
  }

  return (
    <span className={container}>
      <Input
        ref={inputRef}
        type="text"
        aria-label="Search"
        placeholder="Search"
        value={query}
        onChange={setQuery}
        className={input}
        autoFocus
        onBlur={() => {
          if (!query.trim()) close()
        }}
        onKeyDown={event => {
          if (event.key === 'Escape') {
            event.stopPropagation()
            close()
          }
        }}
      />
      <Icon
        title="Clear search"
        icon={iconClose}
        hoverable
        padding
        onClick={close}
      />
    </span>
  )
}
