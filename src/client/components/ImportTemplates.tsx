import React, { ChangeEvent, MouseEvent, useState } from 'react';
import { useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { AppContext, newErrorAlert } from '../App';
import api from '../api';
import { ApiMessage } from '../types/api';

const ImportTemplates = (): React.ReactElement => {
  const ctx: AppContext = useOutletContext();
  const navigator = useNavigate();
  const { userId } = useParams();
  const [qp] = useSearchParams();
  const [importIsOpen, setImportIsOpen] = useState(false);
  const [files, setFiles] = useState<FileList | null>();
  const selectFiles = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setFiles(e.target.files);
  };

  const uploadFiles = async (e: MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!files) {
      ctx.setAlert(newErrorAlert('Failed to create new templates: no files selected.'));
      return;
    }

    if (!ctx.user) {
      throw 'critical error: no user detected';
    }

    for (let i = 0; i < files.length; ++i) {
      const file = files.item(i);
      if (!file) {
        continue;
      }
      await api.template
        .createTemplate(ctx.user.id, file)
        .then(({ template }) => {
          navigator(`/users/${userId}/templates/${template.id}` + (qp.toString() !== '' ? `?${qp.toString()}` : ''));
        })
        .catch((err: ApiMessage) => {
          ctx.setAlert(newErrorAlert(err.message));
        });
    }
  };

  const importFormClicked = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setFiles(null);
    setImportIsOpen(!importIsOpen);
  };

  return (
    <>
      <div className="row g-3 justify-content-end mb-2">
        <div className="col-auto">
          <button className="btn btn-info" onClick={importFormClicked}>
            Import Template
          </button>
        </div>
      </div>
      <form className={`bldr-import-shelf-${importIsOpen ? 'out' : 'in'}`}>
        <div className="row g-3 justify-content-end">
          <div className="col-auto">
            <input className="form-control" type="file" id="templateFile" onChange={selectFiles} />
          </div>
          <div className="col-auto">
            <input type="submit" className="btn btn-primary" onClick={uploadFiles} />
          </div>
        </div>
      </form>
    </>
  );
};

export default ImportTemplates;
