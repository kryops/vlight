import * as icons from '@mdi/js'

/**
 * Resolves an icon name (e.g. `mdiAirplaneLanding`) to the actual icon SVG path.
 *
 * Returns `undefined` if the icon is not found.
 */
export function resolveIcon(icon: string | undefined): string | undefined {
  return (icon && (icons as Record<string, string>)[icon]) || undefined
}
