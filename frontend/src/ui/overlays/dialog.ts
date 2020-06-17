import { ReactElement } from 'react'

import { showModal } from './modal'
import { ModalButton, buttonOk } from './buttons'

export function showDialog<T = true>(
  content: string | ReactElement,
  buttons: ModalButton<T>[] = [buttonOk as ModalButton<any>]
): Promise<T> {
  return showModal({ content, buttons })
}
