import { logError } from '../util/log'
import { howLong } from '../util/time'

import { initEntities } from './access'
import { initPersistedState } from './state'

export * from './masterdata'

export async function initDatabase() {
  const start = Date.now()
  initEntities()
  initPersistedState()
  howLong(start, 'initDatabase')
}

export async function reloadDatabase() {
  try {
    initEntities()
  } catch (error) {
    logError(
      'Error reloading database, the update may have only been partial!',
      error
    )
  }
}
