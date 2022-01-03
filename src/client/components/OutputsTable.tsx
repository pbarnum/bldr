import React from "react";
import { Link } from "react-router-dom";
import { Output } from "../types/output";

export interface OutputsTableProps {
  outputList: Output[];
  isAdmin: boolean;
  onClick?: (output: Output, isSelected: boolean) => void;
}

const OutputsTable = (props: OutputsTableProps): React.ReactElement => {
  const rowClick = (output: Output) => {
    return (e: React.MouseEvent<HTMLTableRowElement>) => {
      e.preventDefault();
      if (!e || !e.currentTarget || !e.currentTarget.parentElement) {
        return;
      }

      Array.from(e.currentTarget.parentElement.children).forEach((row) => {
        if (row !== e.currentTarget) {
          row.classList.remove("table-primary");
        }
      });
      const isSet = e.currentTarget.classList.toggle("table-primary");
      if (props.onClick) {
        props.onClick(output, isSet);
      }
    };
  };

  return (
    <>
      {props.outputList.length === 0 ? (
        <div className="d-flex justify-content-center">
          <h3>No Files Found</h3>
        </div>
      ) : (
        <table className="table table-hover bldr-templates-table">
          <thead>
            <tr>
              {props.isAdmin ? <th>User</th> : <></>}
              <th>Name</th>
              <th>Template</th>
              <th>Added</th>
            </tr>
          </thead>
          <tbody>
            {props.outputList.map((output, i) => (
              <tr key={`output-list-${i}`} onClick={rowClick(output)}>
                {props.isAdmin ? (
                  <td key={`output-list-${i}-user`}>
                    <Link to={`/users/${output.userId}`}>
                      {output.user.name}
                    </Link>
                  </td>
                ) : (
                  <></>
                )}
                <td key={`output-list-${i}-name`}>{output.name}</td>
                <td key={`output-list-${i}-template`}>
                  <Link
                    to={`/users/${output.userId}/templates/${output.templateId}`}
                  >
                    {output.template.name}
                  </Link>
                </td>
                <td key={`output-list-${i}-created`}>{output.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

export default OutputsTable;
