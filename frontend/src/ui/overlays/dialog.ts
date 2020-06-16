import { ReactElement } from 'react'

import { ModalButton, buttonOk, showModal } from './modal'

export function showDialog<T = true>(
  content: string | ReactElement,
  buttons: ModalButton<T>[] = [buttonOk as ModalButton<any>]
): Promise<T> {
  return showModal({ content, buttons })
}
