import { iconSequence } from '../../ui/icons'
import { NavItemEntry } from '../types'
import { sequencesPageRoute } from '../routes'

import SequencesPage from './sequences-page'
import { isAnySequenceRunning } from './sequences-actions'

export const sequencesPageNavItem: NavItemEntry = {
  route: sequencesPageRoute,
  icon: iconSequence,
  label: 'Sequences',
  page: SequencesPage,
  highlighted: isAnySequenceRunning,
}
