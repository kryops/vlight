import { createConnection } from 'net'

import { tcpPort } from '../src/config'
import { logInfo } from '../src/util/log'

const socket = createConnection(tcpPort, undefined, () => {
  logInfo('TCP client connected')
})

socket.on('data', data => logInfo('message', data))
