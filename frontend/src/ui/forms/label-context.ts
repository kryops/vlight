import { createContext, use } from 'react'

/**
 * Provides the ID of the surrounding `Label`'s text.
 *
 * Kept separate from the `Label` component so the CSS-in-JS build-time evaluation
 * does not need to evaluate React.
 */
export const LabelIdContext = createContext<string | undefined>(undefined)

/**
 * Returns the ID of the surrounding `Label`'s text,
 * to be used as `aria-labelledby` by input components.
 */
export function useLabelId(): string | undefined {
  return use(LabelIdContext)
}
