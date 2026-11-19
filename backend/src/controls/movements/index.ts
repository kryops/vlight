import { howLong } from '../../util/time'

import { initLiveMovements } from './live-movements'

export function init(): void {
  const start = Date.now()

  initLiveMovements()

  howLong(start, 'initMovements')
}
