import React, { ReactNode, useEffect, useRef, ReactPortal } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

interface ModalProps {
  children: ReactNode
}

const modalRoot = document.getElementById('modal');

export const Modal = (props: ModalProps): ReactPortal => {
  const element = useRef(document.createElement('div'));

  useEffect(() => {
    modalRoot?.appendChild(element.current);
    return () => {
      modalRoot?.removeChild(element.current);
    }
  }, []);

  const wrapper = (
    <Container>
      {props.children}
    </Container>
  );

  return ReactDOM.createPortal(
    wrapper,
    element.current,
  );
}

const Container = styled.div``