import React from 'react';
import Modal from './Modal';

export interface ModalProps {
  show: boolean;
  isArchived: boolean;
  onCancel?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onOk?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const DeleteOrRestoreUserModal = (props: ModalProps): React.ReactElement => {
  const body = props.isArchived
    ? 'Restoring the User gives them access to their work.'
    : 'An archived User can be restored later.';
  const title = props.isArchived ? 'Restore User' : 'Archive User';

  return (
    <Modal
      title={title}
      body={body}
      success={props.isArchived}
      show={props.show}
      onCancel={props.onCancel}
      onOk={props.onOk}
    />
  );
};

export default DeleteOrRestoreUserModal;
