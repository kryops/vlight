import { Universe } from '../../services/universe'

/**
 * As messages have a fixed width, the DMX universe is represented as blocks.
 */
export const blockSize = 32

/**
 * Message that sets the correct mode "PC Out -> DMX Out"
 */
export function getModeMessage(): number[] {
  const message = new Array(34).fill(0)
  message[0] = 16
  // Modes:
  // 0: Do nothing - Standby
  // 1: DMX In -> DMX Out
  // 2: PC Out -> DMX Out
  // 3: DMX In + PC Out -> DMX Out
  // 4: DMX In -> PC In
  // 5: DMX In -> DMX Out & DMX In -> PC In
  // 6: PC Out -> DMX Out & DMX In -> PC In
  // 7: DMX In + PC Out -> DMX Out & DMX In -> PC In
  message[1] = 2
  return message
}

/**
 * Message that contains the slice of the DMX universe for the given block.
 */
export function getChannelBlockMessage(
  universe: Universe,
  block: number
): number[] {
  const universeBlock = universe.slice(
    block * blockSize,
    (block + 1) * blockSize
  )

  if (universeBlock.length === blockSize) {
    return [0, block, ...universeBlock]
  }

  return [
    0,
    block,
    ...universeBlock,
    ...new Array(blockSize - universeBlock.length).fill(0),
  ]
}
