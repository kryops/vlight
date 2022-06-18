import { logger } from '@vlight/utils'

/**
 * Waits for the given amount of time in ms.
 */
export async function delay(ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Measures how much time passed since the given start timestamp (in ms).
 */
export function howLong(start: number, label: string): void {
  const ms = Date.now() - start
  logger.debug(`${label} took ${ms / 1000}s`)
}
