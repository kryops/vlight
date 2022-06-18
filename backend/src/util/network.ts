import { AddressInfo } from 'net'

/** Returns the given IP address as string. */
export function getAddressString(address: string | AddressInfo | {}): string {
  if (typeof address === 'string') {
    return address
  }
  if (!('address' in address)) return JSON.stringify(address)
  return address.address + ':' + address.port
}
