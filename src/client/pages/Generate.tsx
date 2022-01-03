import React, { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";
import TemplateVariables from "../components/TemplateVariables";
import * as Global from "../global";
import api from "../api";
import { AppContext, newErrorAlert, newSuccessAlert } from "../App";
import { useOutletContext, useParams } from "react-router-dom";
import { ApiMessage } from "../types/api";
import { ListTemplatesResp, Template } from "../types/template";
import Unauthorized from "../components/Unauthorized";

const Generate = (): React.ReactElement => {
  const { userId } = useParams();
  // const [progress, setProgress] = useState<number>(0);
  // const [compileError, setCompileError] = useState<boolean | null>(null);
  const [templateOptions, setTemplateOptions] = useState<
    Global.TemplateOption[]
  >([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<Global.TemplateOption | null>(null);
  // const [templateContents, setTemplateContents] = useState<string>("");
  const [templateVariables, setTemplateVariables] = useState<
    Global.TemplateVariable[]
  >([]);
  const [fileName, setFileName] = useState<string>("");
  const ctx: AppContext = useOutletContext();

  useEffect(() => {
    if (!userId) {
      setTemplateOptions([]);
      return;
    }

    // TODO: Figure out better way to select a template
    api.template
      .listTemplates(userId, 1, 1000)
      .then((res: ListTemplatesResp) => {
        const { templates } = res;
        setTemplates(templates);
        const options = templates.reduce<Global.TemplateOption[]>(
          (prev, current) => {
            return [...prev, { label: current.name, value: current.id }];
          },
          []
        );
        setTemplateOptions(options);
      })
      .catch((err: ApiMessage) => {
        ctx.setAlert(newErrorAlert(err.message));
        setTemplates([]);
        setTemplateOptions([]);
      });
  }, [userId]);

  const selectTemplateHandler = (
    selected: SingleValue<Global.TemplateOption>
  ) => {
    if (!selected) {
      console.error("no template selected");
      return;
    }

    const template = templates.find((t) => t.id === selected.value);
    if (!template) {
      console.error("cant find template");
      return;
    }

    const data: Global.TemplateVariable[] = [];
    const matches = template.contents.match(Global.TemplateVariableRegex);
    if (matches && matches.length > 0) {
      Object.keys(
        matches.reduce((prev, cur) => Object.assign(prev, { [cur]: true }), {})
      ).forEach((key) => data.push({ label: key, value: key }));
    }
    // setTemplateContents(template.contents);
    setSelectedTemplate(selected);
    setFileName(selected.value);
    setTemplateVariables(data);
  };

  const compile = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!ctx.user || !selectedTemplate) {
      console.error("no user or template?", ctx.user, selectedTemplate);
      return;
    }

    // setShowModal(true);
    // setCompileError(false);
    // setProgress(0);

    if (!/^[\w-.]+$/.test(fileName)) {
      console.error("bad file name", fileName);
      // setModalBody(dangerModalBody("File name is invalid"));
      // setCompileError(true);
      // setProgress(1);
      return;
    }

    // TODO: Validate template
    // setModalBody('Validating template...');
    const vars: { [key: string]: string } = templateVariables.reduce(
      (prev, current) => {
        return Object.assign(prev, { [current.label]: current.value });
      },
      {}
    );

    api.output
      .createOutput(ctx.user.id, selectedTemplate.value, fileName, vars)
      .then(() => {
        ctx.setAlert(newSuccessAlert(`Saved '${fileName}' successfully!`));
      })
      .catch((err: ApiMessage) => {
        ctx.setAlert(newErrorAlert(err.message));
      });
  };

  const onVariableChange = (label: string, value: string) => {
    setTemplateVariables(
      templateVariables.map((v) => {
        if (v.label === label) {
          return Object.assign(v, { value });
        }
        return v;
      })
    );
  };

  const changeName = (name: string) => {
    setFileName(name);
  };

  if (!ctx.user || !userId) {
    return (
      <Unauthorized
        title="Unauthorized"
        message="You cannot generate files without being logged in!"
      />
    );
  }

  return (
    <>
      <div className="jumbotron">
        <h1 className="display-4">Generate</h1>
        <p className="lead">Generate files using available Templates.</p>
        <hr className="my-4" />
      </div>
      <div className="row align-items-end">
        <div className="col">
          <h3>Step #1</h3>
          <p className="mb-0">Select an available Template</p>
        </div>
        <div className="col">
          <Select
            value={selectedTemplate}
            onChange={selectTemplateHandler}
            options={templateOptions}
          />
        </div>
      </div>
      {selectedTemplate && (
        <>
          <hr className="my-4" />
          <div className="row align-items-end">
            <div className="col">
              <h3>Step #2</h3>
              <p className="mb-0">Replace variables</p>
            </div>
          </div>
          <div className="row">
            <div className="col tv-container border">
              <TemplateVariables
                variables={templateVariables}
                onChange={onVariableChange}
              />
            </div>
          </div>
          <hr className="my-4" />
          <div className="row align-items-end">
            <div className="col">
              <h3>Step #3</h3>
              <p className="mb-0">
                Compile the template with the provided variables
              </p>
            </div>
            <div className="col">
              <label htmlFor="file-name" className="form-label">
                File Name
              </label>
              <input
                id="file-name"
                className="form-control"
                onChange={(e) => changeName(e.target.value)}
                defaultValue={selectedTemplate.value}
              />
            </div>
            <div className="col">
              <a href="#" className="btn btn-primary" onClick={compile}>
                Compile
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Generate;
