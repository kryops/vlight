import { DynamicPage } from '@vlight/types'

import { Icon } from '../../ui/icons/icon'
import { iconConfig } from '../../ui/icons'
import { openEntityEditorForId } from '../config/entities/editors'

export interface DynamicPageActionsProps {
  dynamicPage: DynamicPage
}

/**
 * Corner actions for dynamic pages:
 * - Configure
 */
export function DynamicPageActions({ dynamicPage }: DynamicPageActionsProps) {
  return (
    <>
      <Icon
        icon={iconConfig}
        hoverable
        inline
        onClick={() => openEntityEditorForId('dynamicPages', dynamicPage.id)}
      />
    </>
  )
}
