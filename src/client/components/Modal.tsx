import React from 'react';
import { Modal as BsModal } from 'react-bootstrap';

export interface ModalProps {
  title: string;
  body: string;
  show: boolean;
  success?: boolean;
  onCancel?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onOk?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const Modal = (props: ModalProps): React.ReactElement => {
  return (
    <BsModal show={props.show}>
      <BsModal.Header>{props.title}</BsModal.Header>
      <BsModal.Body>
        <p>{props.body}</p>
      </BsModal.Body>
      <BsModal.Footer>
        <button className={'btn btn-' + (props.success === true ? 'success' : 'danger')} onClick={props.onOk}>
          Confirm
        </button>
        <button className="btn btn-secondary" onClick={props.onCancel}>
          Cancel
        </button>
      </BsModal.Footer>
    </BsModal>
  );
};

export default Modal;
