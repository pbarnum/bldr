import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useOutletContext } from 'react-router-dom';
import { AppContext, newErrorAlert } from '../App';
import api from '../api';
import { ApiMessage } from '../types/api';
import { DownloadOutputResp, Output } from '../types/output';

export interface DisplayOutputFileProps {
  output?: Output | null;
}

const DisplayOutputFile = (props: DisplayOutputFileProps): React.ReactElement => {
  const ctx: AppContext = useOutletContext();
  const [showModal, setShowModal] = useState<boolean>(false);

  const openModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowModal(true);
  };

  const closeModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowModal(false);
  };

  const deleteFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!props.output) {
      return;
    }

    setShowModal(false);

    api.output
      .deleteOutput(props.output)
      .catch((err: ApiMessage) => {
        ctx.setAlert(newErrorAlert(err.message));
      })
      .finally(() => {
        setShowModal(false);
      });
  };

  const downloadFile = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!props.output) {
      return;
    }

    await api.output
      .downloadOutput(props.output)
      .then((res: DownloadOutputResp) => {
        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([res.contents]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', res.fileName);

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      })
      .catch((err: ApiMessage) => {
        ctx.setAlert(newErrorAlert(err.message));
      });
  };

  return (
    <>
      <Modal show={showModal}>
        <Modal.Header>Are you sure?</Modal.Header>
        <Modal.Body>
          <p>Archived files can be restored.</p>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-danger" onClick={(e) => deleteFile(e)}>
            Confirm
          </button>
          <button className="btn btn-secondary" onClick={(e) => closeModal(e)}>
            Cancel
          </button>
        </Modal.Footer>
      </Modal>
      {!props.output ? (
        <div className="text-center">
          <h3>No File</h3>
          <h5>Select a File above.</h5>
        </div>
      ) : (
        <>
          <div className="row">
            <div className="col">
              <h3>{props.output.name}</h3>
            </div>
          </div>
          <div className="row mb-2">
            <div className="col d-flex justify-content-end">
              <button
                className="btn btn-danger"
                onClick={(e) => {
                  openModal(e);
                }}
              >
                Archive
              </button>
              &nbsp;&nbsp;&nbsp;
              <button
                className="btn btn-primary"
                onClick={(e) => {
                  downloadFile(e);
                }}
              >
                Download
              </button>
            </div>
          </div>
          <div className="row">
            <div className="col-4">
              <div className="mb-3 row">
                <strong className="col-8">Variables Replaced</strong>
                <div className="col">
                  <p className="badge bg-secondary">{props.output.amountReplaced}</p>
                </div>
              </div>
            </div>
            <div className="col">
              <textarea
                className="form-control bldr-template-contents"
                readOnly={true}
                value={props.output.contents}
              ></textarea>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default DisplayOutputFile;
