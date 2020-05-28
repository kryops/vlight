import { ApiInMessage } from '@vlight/api'

import { MapRegistry } from '../../util/registry'

export type ApiMessageHandler<T extends ApiInMessage> = (message: T) => boolean

export const apiMessageHandlerRegistry = new MapRegistry<
  ApiInMessage['type'],
  ApiMessageHandler<any>
>()

export function registerApiMessageHandler<T extends ApiInMessage>(
  key: T['type'],
  handler: ApiMessageHandler<T>
): void {
  apiMessageHandlerRegistry.register(key, handler)
}
