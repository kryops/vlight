import { ProgrammableButton } from '@vlight/types'

import { registerMasterDataEntity } from '../registry'

import { resolveIcon } from './icons'

/**
 * Resolves the icon name to the actual icon SVG path.
 */
function processButton({
  icon,
  ...rest
}: ProgrammableButton): ProgrammableButton {
  return {
    ...rest,
    icon: resolveIcon(icon),
  }
}

/**
 * Ensures that the action lists exist.
 */
function migrateButtons(buttons: ProgrammableButton[]): ProgrammableButton[] {
  return buttons.map(button => ({
    ...button,
    down: button.down ?? [],
    up: button.up ?? [],
  }))
}

function preprocessor(buttons: ProgrammableButton[]): ProgrammableButton[] {
  return buttons.map(processButton)
}

// only for unit test
export const processButtons = preprocessor

export function init(): void {
  registerMasterDataEntity('buttons', {
    migration: migrateButtons,
    preprocessor,
  })
}
