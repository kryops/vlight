import { AddressInfo } from 'net'

export function getAddressString(address: string | AddressInfo): string {
  if (typeof address === 'string') {
    return address
  }
  return address.address + ':' + address.port
}
