import { useSettings } from './settings'

export function useClassName(
  className: string,
  lightModeClassName: string
): string {
  const { lightMode } = useSettings()
  return lightMode ? `${className} ${lightModeClassName}` : className
}
