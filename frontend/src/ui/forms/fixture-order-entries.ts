import { FixtureOrder } from '@vlight/types'

import { SelectEntry } from './select'

/** Select entries for all available fixture orders. */
export const fixtureOrderEntries: SelectEntry<FixtureOrder>[] = [
  { value: 'members', label: 'Index' },
  { value: 'xcoord', label: 'X coord' },
  { value: 'ycoord', label: 'Y coord' },
  { value: 'x+y', label: 'X+Y' },
  { value: 'x-y', label: 'X-Y' },
]
