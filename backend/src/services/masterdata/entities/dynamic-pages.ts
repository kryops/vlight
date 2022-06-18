import { DynamicPage } from '@vlight/types'
import * as icons from '@mdi/js'

import { registerMasterDataEntity } from '../registry'

type IconName = keyof typeof icons

/**
 * Resolves the icon name to the actual icon SVG path.
 */
function processDynamicPage({ icon, ...rest }: DynamicPage): DynamicPage {
  return {
    ...rest,
    icon: (icon && icons[icon as IconName]) ?? undefined,
  }
}

function preprocessor(groups: DynamicPage[]): DynamicPage[] {
  return groups.map(processDynamicPage)
}

export function init(): void {
  registerMasterDataEntity('dynamicPages', { preprocessor })
}
