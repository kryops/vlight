import { createConnection } from 'net'

import { logger } from '@vlight/utils'

import { tcpPort } from '../src/services/config'

const socket = createConnection(tcpPort, undefined, () => {
  logger.info('TCP client connected')
})

socket.on('data', data => logger.info('message', data))
