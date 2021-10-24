# vLight Client Protocol

## Connection

### WebSocket

Connect to `/websocket`

Upon connection, the client will be sent the universe

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
