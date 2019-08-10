import { logTrace } from './log'

export async function delay(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms))
}

export async function howLong(start: number, label: string) {
  const ms = Date.now() - start
  logTrace(`${label} took ${ms / 1000}s`)
}
