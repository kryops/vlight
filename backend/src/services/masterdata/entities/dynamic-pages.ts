import { DynamicPage } from '@vlight/types'
import * as icons from '@mdi/js'

import { registerMasterDataEntity } from '../registry'

/**
 * Resolves the icon name to the actual icon SVG path.
 */
function processDynamicPage({ icon, ...rest }: DynamicPage): DynamicPage {
  return {
    ...rest,
    icon: (icon && (icons as Record<string, string>)[icon]) ?? undefined,
  }
}

function preprocessor(groups: DynamicPage[]): DynamicPage[] {
  return groups.map(processDynamicPage)
}

export function init(): void {
  registerMasterDataEntity('dynamicPages', { preprocessor })
}
