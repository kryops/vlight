import { createConnection } from 'net'

import { tcpPort } from '../src/services/config'
import { logger } from '../src/util/shared'

const socket = createConnection(tcpPort, undefined, () => {
  logger.info('TCP client connected')
})

socket.on('data', data => logger.info('message', data))
