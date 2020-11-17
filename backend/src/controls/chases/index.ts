import { howLong } from '../../util/time'

import { initLiveChases } from './live-chases'

export function init(): void {
  const start = Date.now()

  initLiveChases()

  howLong(start, 'initChases')
}
