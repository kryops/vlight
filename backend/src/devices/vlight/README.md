# vLight Binary Protocol

via TCP or UDP

## Message Format

### DMX Universe

Length: 513 Bytes

`0xff` followed by 1 Byte per channel

```
0xff <value> <value> <value> ...
```

This message is sent by the server upon connecting (TCP) or periodically (UDP)

### DMX Channel

Length: 2 Bytes (Channel 1-250) or 3 Bytes (Channel 256-512)

Channel 1-250:

```
<channel-1> <value>
```

Channel 251-500:

```
0xfa <channel-251> <value>
```

Channel 501-512:

```
0xfb <channel-501> <value>
```

## UDP Multicast

- IP: 224.0.0.244
- Port: 43234
- 1 Datagram per message

## TCP Settings

- Port: 43235
