import React from "react";
import * as Global from "../global";

export interface TemplateVariablesProps {
  variables: Global.TemplateVariable[];
  onChange: (label: string, value: string) => void;
}

const TemplateVariables = (
  props: TemplateVariablesProps
): React.ReactElement => {
  const columns = 3;
  return (
    <>
      {props.variables
        .reduce<Global.TemplateVariable[][]>((prev, cur, i) => {
          if (i % columns === 0) {
            prev.push([]);
          }
          prev[prev.length - 1].push(cur);
          return prev;
        }, [])
        .map((group: Global.TemplateVariable[], i) => (
          <div className="row mb-3" key={`tv-row-${i}`}>
            {group.map((variable: Global.TemplateVariable, j) => (
              <div className="col" key={`tv-col-${i}-${j}`}>
                <label
                  key={`tv-label-${i}-${j}`}
                  htmlFor={`var-${i}-${j}`}
                  className="form-label"
                >
                  {variable.label}
                </label>
                <input
                  key={`tv-input-${i}-${j}`}
                  id={`var-${i}-${j}`}
                  className="form-control"
                  defaultValue={variable.value}
                  onChange={(e) =>
                    props.onChange(variable.label, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        ))}
    </>
  );
};

export default TemplateVariables;
