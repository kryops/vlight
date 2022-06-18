import { ApiInMessage } from '@vlight/types'

import { MapRegistry } from '../../util/registry'

/**
 * Handler for an incoming API message.
 * Returns whether the message caused any changes.
 */
export type ApiMessageHandler<T extends ApiInMessage> = (message: T) => boolean

/** Registry of API message handlers by type. */
export const apiMessageHandlerRegistry = new MapRegistry<
  ApiInMessage['type'],
  ApiMessageHandler<any>
>()

/**
 * Registers an API message handler for the given message type.
 */
export function registerApiMessageHandler<T extends ApiInMessage>(
  key: T['type'],
  handler: ApiMessageHandler<T>
): void {
  apiMessageHandlerRegistry.register(key, handler)
}
