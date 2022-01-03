import React from "react";
import { Template } from "../types/template";

export interface DisplayTemplateProps {
  template?: Template | null;
}

const DisplayTemplate = (props: DisplayTemplateProps): React.ReactElement => {
  return (
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
            <div className="row">
              <div className="col-4">
                <div className="mb-3 row">
                  <strong className="col">Total Vars</strong>
                  <div className="col">
                    <p className="badge bg-secondary">
                      {props.template.totalVariables}
                    </p>
                  </div>
                </div>
                <div className="mb-3 row">
                  <strong className="col">Unique Vars</strong>
                  <div className="col">
                    <p className="badge bg-secondary">
                      {props.template.uniqueVariables}
                    </p>
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
  );
};

export default DisplayTemplate;
