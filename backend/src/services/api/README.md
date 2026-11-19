# vLight Client Protocol

## Connection

### WebSocket

Connect to `/websocket`

Upon connection, the client will be sent the full state.

DMX universe updates are only sent to clients that subscribed with a `universe-subscription` message. Upon subscribing, the client is sent the complete universe, followed by deltas.

### HTTP/REST

Send a POST request to `/api`

- Header: `Content-Type: application/json`
- Set the message as request body

Success Response:

```json
{ "ok": true }
```

Error Response:

```ts
{
  "ok": false,
  "error": string
}
```

## Protocol / Messages

See the TypeScript definitions under [shared/types/api.d.ts](../../../shared/types/api.d.ts)
