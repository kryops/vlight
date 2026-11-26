import { css } from '@linaria/core'

import { useMasterData } from '../../hooks/api'
import { getHotkeyLabel, useNumberHotkey } from '../../hooks/hotkey'
import { Header } from '../../ui/containers/header'
import { pageWithWidgets } from '../../ui/css/page'
import { SequenceWidget } from '../../widgets/sequence/sequence-widget'
import { useSearch } from '../../hooks/search'
import { SearchToggle } from '../../ui/components/search-toggle'
import { NoSearchResults } from '../../ui/components/no-search-results'

import { SequencesActions } from './sequences-actions'

const emptyHint = css`
  opacity: 0.6;
  font-style: italic;
`

/**
 * Sequences page.
 *
 * Displays widgets for all configured sequences.
 */
const SequencesPage = () => {
  const { sequences: allSequences } = useMasterData()
  const search = useSearch()

  const sequences = search.active
    ? allSequences.filter(sequence =>
        search.matches(sequence.name ?? sequence.id)
      )
    : allSequences

  const activeHotkeyIndex = useNumberHotkey(sequences.length, search.query)

  return (
    <>
      <Header
        rightContent={
          <>
            <SearchToggle {...search} />
            <SequencesActions />
          </>
        }
      >
        Sequences
      </Header>
      <div className={pageWithWidgets}>
        {sequences.map((sequence, index) => (
          <SequenceWidget
            key={sequence.id}
            sequence={sequence}
            cornerLabel={getHotkeyLabel(index)}
            hotkeysActive={activeHotkeyIndex === index}
          />
        ))}
      </div>
      {allSequences.length === 0 && (
        <p className={emptyHint}>No sequences configured yet</p>
      )}
      {search.active && allSequences.length > 0 && sequences.length === 0 && (
        <NoSearchResults />
      )}
    </>
  )
}

export default SequencesPage
