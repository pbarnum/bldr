import React, { ChangeEvent, MouseEvent, useState } from "react";
import AvailableTemplates from "../components/AvailableTemplates";
import DisplayTemplate from "../components/DisplayTemplate";
import Unauthorized from "../components/Unauthorized";
import { Template } from "../types/template";
import { AppContext, newErrorAlert } from "../App";
import { useOutletContext, useParams } from "react-router-dom";
import api from "../api";
import { ApiMessage } from "../types/api";

const Templates = (): React.ReactElement => {
  const { userId } = useParams();
  const ctx: AppContext = useOutletContext();
  const [importIsOpen, setImportIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [files, setFiles] = useState<FileList | null>();

  const selectedTemplateCallback = (template: Template | null) => {
    setSelectedTemplate(template);
  };

  const selectFiles = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setFiles(e.target.files);
  };

  const uploadFiles = async (e: MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!files) {
      ctx.setAlert(
        newErrorAlert("Failed to create new templates: no files selected.")
      );
      return;
    }

    if (!ctx.user) {
      throw "critical error: no user detected";
    }

    for (let i = 0; i < files.length; ++i) {
      const file = files.item(i);
      if (!file) {
        continue;
      }
      await api.template
        .createTemplate(ctx.user.id, file)
        .then(() => {
          // FIXME: Appending new template to paginated list causes a discrepency with ListTemplates API response
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

  if (!ctx.user || !userId) {
    return (
      <Unauthorized
        title="Unauthorized"
        message="You cannot view templates without being logged in!"
      />
    );
  }

  return (
    <>
      <div className="jumbotron">
        <h1 className="display-4">Templates</h1>
        <p className="lead">
          Templates that have been uploaded and validated successfully.
        </p>
        <hr className="my-4" />
      </div>
      <div className="row">
        <div className="col">
          <h3>Available Templates</h3>
        </div>
      </div>
      <div className="row g-3 justify-content-end mb-2">
        <div className="col-auto">
          <button className="btn btn-info" onClick={importFormClicked}>
            Import Template
          </button>
        </div>
      </div>
      <form className={`bldr-import-shelf-${importIsOpen ? "out" : "in"}`}>
        <div className="row g-3 justify-content-end">
          <div className="col-auto">
            <input
              className="form-control"
              type="file"
              id="templateFile"
              onChange={selectFiles}
            />
          </div>
          <div className="col-auto">
            <input
              type="submit"
              className="btn btn-primary"
              onClick={uploadFiles}
            />
          </div>
        </div>
      </form>
      <AvailableTemplates
        userId={userId}
        selectedCallback={selectedTemplateCallback}
      />
      <hr className="my-4" />
      <DisplayTemplate template={selectedTemplate} />
    </>
  );
};

export default Templates;
