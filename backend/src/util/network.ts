import { AddressInfo } from 'net'
import { networkInterfaces } from 'os'

/** Returns the given IP address as string. */
export function getAddressString(
  address: string | AddressInfo | { address?: string; port?: number }
): string {
  if (typeof address === 'string') {
    return address
  }
  if (!('address' in address)) return JSON.stringify(address)
  return address.address + ':' + address.port
}

export function getLocalNetworkIp(): string | null {
  const info = networkInterfaces()
  for (const record of Object.values(info).flat()) {
    if (record?.address.startsWith('192.')) {
      return record.address
    }
  }
  return null
}
