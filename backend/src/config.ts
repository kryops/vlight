// technical config
export const httpPort = 8000

export const tcpPort = 43235

export const udpPort = 43234
export const udpMulticastAddress = '224.0.0.244'
export const udpUniverseInterval = 1000

export const artnetHost = '255.255.255.255'

export const devicesFlushInterval = 20
export const socketFlushInterval = 100
export const multiChannelUniverseFlushThreshold = 200

// application config
export const universeSize = 512

// environment
export const isDevelopment = process.env.NODE_ENV === 'development'
