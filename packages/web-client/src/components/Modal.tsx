import React, { ReactNode, useEffect, useRef, ReactPortal } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

interface ModalProps {
  children: ReactNode
  onClose?: () => void
}

const modalRoot = document.getElementById('modal');

export const Modal = (props: ModalProps): ReactPortal => {
  const element = useRef<HTMLDivElement>(document.createElement('div'));
  const containerRef = useRef<HTMLDivElement>();

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
    <Container
      onClick={handleOnClose}
      ref={containerRef as any}
    >
      <Content>
        {props.children}
      </Content>
    </Container>
  );

  return ReactDOM.createPortal(
    wrapper,
    element.current,
  );
}

const Container = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  z-index: 10;
  background: rgba(1,1,1,.4);
  padding: 50px 0;
  animation: fade-in .35s ease;

  @keyframes fade-in {
    0% {
      opacity: 0.8;
    }
    100% {
      opacity: 1;
    }
  }
`

const Content = styled.div`
  width: 60%;
  height: 90%;
  margin: 0 auto;
  overflow-y: auto;
  animation: slide-in .35s ease;

  @keyframes slide-in {
    0% {
      transform: translateY(-50px);
    }
    100% {
      transform: translateY(0);
    }
  }
`

export default Modal;