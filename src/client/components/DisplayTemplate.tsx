import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useOutletContext } from 'react-router-dom';
import { AppContext, newErrorAlert } from '../App';
import api from '../api';
import { ApiMessage } from '../types/api';
import { DownloadTemplateResp, Template } from '../types/template';

export interface DisplayTemplateProps {
  template?: Template | null;
}

const DisplayTemplate = (props: DisplayTemplateProps): React.ReactElement => {
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

    if (!props.template) {
      return;
    }

    setShowModal(false);

    api.template
      .deleteTemplate(props.template)
      .catch((err: ApiMessage) => {
        ctx.setAlert(newErrorAlert(err.message));
      })
      .finally(() => {
        setShowModal(false);
      });
  };

  const downloadFile = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!props.template) {
      return;
    }

    await api.template
      .downloadTemplate(props.template)
      .then((res: DownloadTemplateResp) => {
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
      <div className="row">
        <div className="col">
          {!props.template ? (
            <div className="text-center">
              <h3>No Template</h3>
              <h5>Select a Template above or add a new one.</h5>
            </div>
          ) : (
            <>
              <div className="row">
                <div className="col">
                  <h3>{props.template.name}</h3>
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
                    <strong className="col">Total Vars</strong>
                    <div className="col">
                      <p className="badge bg-secondary">{props.template.totalVariables}</p>
                    </div>
                  </div>
                  <div className="mb-3 row">
                    <strong className="col">Unique Vars</strong>
                    <div className="col">
                      <p className="badge bg-secondary">{props.template.uniqueVariables}</p>
                    </div>
                  </div>
                </div>
                <div className="col">
                  <textarea
                    className="form-control bldr-template-contents"
                    readOnly={true}
                    value={props.template.contents}
                  ></textarea>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DisplayTemplate;
