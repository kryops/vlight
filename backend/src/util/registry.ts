import { logger } from './shared'

export class ListRegistry<T> {
  entries: T[] = []

  register(entry: T): void {
    this.entries.push(entry)
  }

  async runParallel(cb: (entry: T) => void | Promise<void>): Promise<void> {
    await Promise.all(this.entries.map(cb))
  }
}

export class MapRegistry<TKey, TEntry> {
  entries = new Map<TKey, TEntry>()

  register(key: TKey, entry: TEntry): void {
    if (this.get(key)) {
      logger.error(`Duplicate registry entry for key`, key)
    }
    this.entries.set(key, entry)
  }

  get(key: TKey): TEntry | undefined {
    return this.entries.get(key)
  }
}
