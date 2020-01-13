import React, { useState, ReactNode, useEffect } from 'react';
import { Modal as NativeModal } from '../components/Modal';

interface ModalProps {
  children: ReactNode
}

const HIDE_OVERFLOW_CSS = 'modal-opened';

/**
 * @example
 * ```tsx
 * const { Modal, ...modalContext } = useModal();
 * ```
 */
export const useModal = () => {
  const [isOpened, setIsOpened] = useState<boolean>(false);

  const toggle = (): void => setIsOpened(status => !status);

  const close = (): void => setIsOpened(false);
  
  const open = (): void => setIsOpened(true);

  const Modal = (props: ModalProps) => isOpened ? (
    <NativeModal onClose={close}>
      {props.children}
    </NativeModal>
  ) : null;

  useEffect(() => {
    const { classList } = document.body;
    const method = isOpened ? 'add' : 'remove';

    classList[method](HIDE_OVERFLOW_CSS);

    return () => {
      classList.remove(HIDE_OVERFLOW_CSS);
    }
  }, [isOpened]);

  return {
    Modal,
    open,
    close,
    toggle,
  }
}