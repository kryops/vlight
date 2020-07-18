import { ReactElement } from 'react'

import { showModal, ModalProps } from './modal'
import { ModalButton, buttonOk } from './buttons'

export function showDialog<T = true>(
  content: string | ReactElement,
  buttons: ModalButton<T>[] = [buttonOk as ModalButton<any>],
  additionalProps: Partial<ModalProps<T>> = {}
): Promise<T> {
  return showModal({ ...additionalProps, content, buttons })
}
