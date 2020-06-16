import React, { ReactElement, ComponentType } from 'react'
import { mdiCheck, mdiClose } from '@mdi/js'
import { css } from 'linaria'

import { Icon } from '../icons/icon'
import { zOverlay, primaryShade, baselinePx, iconShade } from '../styles'

import { removeOverlay, addOverlay } from './overlay'

export interface ModalButton<T> {
  icon: string
  label: string
  value: T
}

export const buttonOk: ModalButton<true> = {
  icon: mdiCheck,
  label: 'Ok',
  value: true,
}

export const buttonYes: ModalButton<true> = {
  icon: mdiCheck,
  label: 'Yes',
  value: true,
}

export const buttonNo: ModalButton<false> = {
  icon: mdiClose,
  label: 'No',
  value: false,
}

export const buttonCancel: ModalButton<null> = {
  icon: mdiClose,
  label: 'Cancel',
  value: null,
}

export const yesNo = [buttonYes, buttonNo]
export const okCancel = [buttonOk, buttonCancel]

export interface ModalProps<T> {
  onClose: (result: T) => void
  showCloseButton?: boolean
  closeOnBackDrop?: boolean
  title?: string | ReactElement
  content: string | ReactElement
  Content?: ComponentType<{ onClose?: (value: T) => void }>
  buttons?: ModalButton<T>[]
}

const backDrop = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  overflow-y: auto;
  z-index: ${zOverlay};
`

const modalContainer = css`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: ${baselinePx * 4}px;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
`

const modal = css`
  min-width: ${baselinePx * 64}px;
  max-width: 95vh;
  padding: ${baselinePx * 8}px;
  background: ${primaryShade(2)};
`

const closeButton = css`
  float: right;
  margin: ${baselinePx * -6}px;
  padding: ${baselinePx * 2}px;
`

const titleStyle = css`
  margin-top: 0;
`

const buttonContainer = css`
  display: flex;
  margin-top: ${baselinePx * 8}px;
  margin-bottom: ${baselinePx * -4}px;
  border-top: 1px solid ${iconShade(2)};
`

const buttonStyle = css`
  display: flex;
  flex: 1 1 0;
  min-width: 0;
  align-items: center;
  justify-content: center;
  padding: ${baselinePx * 4}px;
  box-sizing: content-box;
`

const buttonIcon = css`
  flex: 0 0 auto;
  padding-right: ${baselinePx * 2}px;
`

export function Modal<T>({
  title,
  content,
  Content,
  buttons,
  onClose,
  closeOnBackDrop,
  showCloseButton,
}: ModalProps<T>) {
  return (
    <div
      className={backDrop}
      onClick={closeOnBackDrop ? () => onClose(null as any) : undefined}
    >
      <div className={modalContainer}>
        <div className={modal}>
          {showCloseButton && (
            <Icon
              icon={mdiClose}
              className={closeButton}
              onClick={() => onClose(null as any)}
            />
          )}
          {title && <h3 className={titleStyle}>{title}</h3>}
          {content}
          {Content && <Content onClose={onClose} />}
          {buttons && (
            <div className={buttonContainer}>
              {buttons.map(({ icon, label, value }, index) => (
                <a
                  key={index}
                  className={buttonStyle}
                  onClick={() => onClose?.(value)}
                >
                  <Icon icon={icon} className={buttonIcon} />
                  <div>{label}</div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function showModal<T>(
  props: Omit<ModalProps<T>, 'onClose'>
): Promise<T> {
  return new Promise<T>(resolve => {
    const Overlay = () => (
      <Modal
        {...props}
        onClose={value => {
          removeOverlay(Overlay)
          resolve(value)
        }}
      />
    )
    addOverlay(Overlay)
  })
}
