import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { AppContext } from '../App';
import { Template } from '../types/template';
import TableFilters from './TableFilters';
import Timestamp from './Timestamp';

export interface TemplatesTableProps {
  templateList: Template[];
  isAdmin: boolean;
  onClick?: (template: Template, isSelected: boolean) => void;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const TemplatesTable = (props: TemplatesTableProps): React.ReactElement => {
  const ctx: AppContext = useOutletContext();

  const rowClick = (template: Template) => {
    return (e: React.MouseEvent<HTMLTableRowElement>) => {
      e.preventDefault();
      if (!e || !e.currentTarget || !e.currentTarget.parentElement) {
        return;
      }

      Array.from(e.currentTarget.parentElement.children).forEach((row) => {
        if (row !== e.currentTarget) {
          row.classList.remove('table-primary');
        }
      });
      const isSet = e.currentTarget.classList.toggle('table-primary');
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
        <>
          <div className="row">
            <div className="col">
              <TableFilters />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <div className="bldr-table-wrapper">
                <table className="table table-hover bldr-templates-table">
                  <thead>
                    <tr>
                      {props.isAdmin ? <th>User</th> : <></>}
                      {ctx.uri.archived ? <th>Archived</th> : <></>}
                      <th>Name</th>
                      <th>Size</th>
                      <th>Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {props.templateList.map((template, i) => (
                      <tr key={`template-list-${i}`} onClick={rowClick(template)}>
                        {props.isAdmin ? (
                          <td key={`template-list-${i}-user`}>
                            <Link to={`/users/${template.userId}`}>{template.user.name}</Link>
                          </td>
                        ) : (
                          <></>
                        )}
                        {ctx.uri.archived ? (
                          <td key={`template-list-${i}-archived`}>
                            {template.deletedAt !== null ? <FontAwesomeIcon icon={faTimesCircle} color="red" /> : <></>}
                          </td>
                        ) : (
                          <></>
                        )}
                        <td key={`template-list-${i}-name`}>{template.name}</td>
                        <td key={`template-list-${i}-size`}>{formatBytes(template.size)}</td>
                        <td key={`template-list-${i}-created`}>
                          <Timestamp value={template.createdAt} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default TemplatesTable;
