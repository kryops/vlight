import { DynamicPage } from '@vlight/entities'
import * as icons from '@mdi/js'

import { registerMasterDataEntity } from '../registry'

type IconName = keyof typeof icons

function processDynamicPage({ icon, ...rest }: DynamicPage): DynamicPage {
  return {
    ...rest,
    icon: (icon && icons[icon as IconName]) ?? undefined,
  }
}

function preprocessor(groups: DynamicPage[]): DynamicPage[] {
  return groups.map(processDynamicPage)
}

export function init() {
  registerMasterDataEntity('dynamicPages', { preprocessor })
}
