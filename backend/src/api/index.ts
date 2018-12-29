import { ApiInMessage } from '@vlight/api'

import { setChannel } from '../universe'
import { logError } from '../util/log'

export function handleApiMessage(message: ApiInMessage) {
  switch (message.type) {
    case 'channel':
      setChannel(message.channel, message.value)
      break

    default:
      logError('Invalid API message', message)
  }
}
