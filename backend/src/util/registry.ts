import { logError } from './log'

export class ListRegistry<T> {
  entries: T[] = []

  register(entry: T) {
    this.entries.push(entry)
  }

  async runParallel(cb: (entry: T) => void | Promise<void>): Promise<void> {
    await Promise.all(this.entries.map(cb))
  }
}

export class MapRegistry<TKey, TEntry> {
  entries = new Map<TKey, TEntry>()

  register(key: TKey, entry: TEntry) {
    if (this.get(key)) {
      logError(`Duplicate registry entry for key`, key)
    }
    this.entries.set(key, entry)
  }

  get(key: TKey) {
    return this.entries.get(key)
  }
}
