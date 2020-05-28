import { logTrace } from './log'

export async function delay(ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms))
}

export function howLong(start: number, label: string): void {
  const ms = Date.now() - start
  logTrace(`${label} took ${ms / 1000}s`)
}
