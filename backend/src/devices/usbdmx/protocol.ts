export const blockSize = 32

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

export function getChannelBlockMessage(
  universe: Buffer,
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
