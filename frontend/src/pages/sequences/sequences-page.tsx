import { css } from '@linaria/core'

import { useMasterData } from '../../hooks/api'
import { getHotkeyLabel, useNumberHotkey } from '../../hooks/hotkey'
import { Header } from '../../ui/containers/header'
import { pageWithWidgets } from '../../ui/css/page'
import { SequenceWidget } from '../../widgets/sequence/sequence-widget'

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
  const { sequences } = useMasterData()
  const activeHotkeyIndex = useNumberHotkey(sequences.length)

  return (
    <>
      <Header rightContent={<SequencesActions />}>Sequences</Header>
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
      {sequences.length === 0 && (
        <p className={emptyHint}>No sequences configured yet</p>
      )}
    </>
  )
}

export default SequencesPage
