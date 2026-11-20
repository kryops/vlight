import { DynamicPage, DynamicPageRow } from '@vlight/types'
import * as icons from '@mdi/js'

import { registerMasterDataEntity } from '../registry'

/**
 * Flattens the legacy `cells` of a row into its `widgets`.
 */
function migrateDynamicPageRow({
  cells,
  widgets,
  ...rest
}: DynamicPageRow): DynamicPageRow {
  return {
    ...rest,
    widgets: [
      ...(widgets ?? []),
      ...(cells ?? []).flatMap(cell => cell.widgets ?? []),
    ],
  }
}

/**
 * Migrates legacy dynamic page configurations to the current format.
 */
export function migrateDynamicPages(pages: DynamicPage[]): DynamicPage[] {
  return pages.map(page => ({
    ...page,
    rows: (page.rows ?? []).map(migrateDynamicPageRow),
  }))
}

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
  registerMasterDataEntity('dynamicPages', {
    migration: migrateDynamicPages,
    preprocessor,
  })
}
