import { broadcastApplicationStateToSockets } from '../api'
import { reloadDatabase } from '../database'
import { reloadControls } from '../controls'
import { logInfo } from '../util/log'

export async function reloadMasterData() {
  logInfo('Reloading master data')
  reloadDatabase()
  reloadControls()
  broadcastApplicationStateToSockets()
}
