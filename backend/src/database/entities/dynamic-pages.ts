import { DynamicPage } from '@vlight/entities'
import * as icons from '@mdi/js'

type IconName = keyof typeof icons

function processDynamicPage({ icon, ...rest }: DynamicPage): DynamicPage {
  return {
    ...rest,
    icon: (icon && icons[icon as IconName]) ?? undefined,
  }
}

export function processDynamicPages(groups: DynamicPage[]): DynamicPage[] {
  return groups.map(processDynamicPage)
}
