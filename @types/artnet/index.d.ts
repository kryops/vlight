export interface Options {
  host?: string
  port?: number
  refresh?: number
  iface?: string
  sendAll?: boolean
}

export type Callback = (err: Error | null, res: any) => void

export interface Artnet {
  set(
    universe: number,
    channel: number,
    value: number | number[],
    callback?: Callback
  ): void
  set(channel: number, value: number | number[], callback?: Callback): void
  set(value: number | number[], callback?: Callback): void

  trigger(oem: number, subkey: number, key: number, callback?: Callback): void
  trigger(subkey: number, key: number, callback?: Callback): void
  trigger(key: number, callback?: Callback): void
}

declare function ArtnetConstructor(options: Options): Artnet

export default ArtnetConstructor
