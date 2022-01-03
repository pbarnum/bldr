import React from "react";
import { Template } from "../types/template";

export interface TemplatesTableProps {
  templateList: Template[];
  onClick?: (template: Template, isSelected: boolean) => void;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const TemplatesTable = (props: TemplatesTableProps): React.ReactElement => {
  const rowClick = (template: Template) => {
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
        props.onClick(template, isSet);
      }
    };
  };

  return (
    <>
      {props.templateList.length === 0 ? (
        <div className="d-flex justify-content-center">
          <h3>No Templates Found</h3>
        </div>
      ) : (
        <table className="table table-hover bldr-templates-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Added</th>
            </tr>
          </thead>
          <tbody>
            {props.templateList.map((template, i) => (
              <tr key={`template-list-${i}`} onClick={rowClick(template)}>
                <td key={`template-list-${i}-name`}>{template.name}</td>
                <td key={`template-list-${i}-size`}>
                  {formatBytes(template.size)}
                </td>
                <td key={`template-list-${i}-created`}>{template.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

export default TemplatesTable;
