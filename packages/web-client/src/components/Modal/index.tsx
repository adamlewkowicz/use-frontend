import React, { ReactNode, useEffect, useRef, ReactPortal } from 'react';
import ReactDOM from 'react-dom';
import css from './index.module.css';
interface ModalProps {
  children: ReactNode
  onClose?: () => void
}

const modalRoot = document.getElementById('modal');

export const Modal = (props: ModalProps): ReactPortal => {
  const element = useRef<HTMLDivElement>(document.createElement('div'));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    modalRoot?.appendChild(element.current);
    return () => {
      modalRoot?.removeChild(element.current);
    }
  }, []);

  const handleOnClose = (event: React.MouseEvent<HTMLDivElement>) => {
    event.persist();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();

    // TODO: temp workaround
    if (event.target !== containerRef.current) return;
  
    props.onClose?.();
  }

  const wrapper = (
    <div
      className={css.container}
      onClick={handleOnClose}
      ref={containerRef}
    >
      <div className={css.content}>
        {props.children}
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    wrapper,
    element.current,
  );
}