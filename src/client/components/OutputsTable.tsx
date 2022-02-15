import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { AppContext } from '../App';
import { Output } from '../types/output';
import TableFilters from './TableFilters';
import Timestamp from './Timestamp';

export interface OutputsTableProps {
  outputList: Output[];
  isAdmin: boolean;
  onClick?: (output: Output, isSelected: boolean) => void;
}

const OutputsTable = (props: OutputsTableProps): React.ReactElement => {
  const ctx: AppContext = useOutletContext();
  const rowClick = (output: Output) => {
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
        <>
          <div className="row">
            <div className="col">
              <TableFilters />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <table className="table table-hover bldr-templates-table">
                <thead>
                  <tr>
                    {props.isAdmin ? <th>User</th> : <></>}
                    {ctx.uri.archived ? <th>Archived</th> : <></>}
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
                          <Link to={`/users/${output.userId}`}>{output.user.name}</Link>
                        </td>
                      ) : (
                        <></>
                      )}
                      {ctx.uri.archived ? (
                        <td key={`output-list-${i}-archived`}>
                          {output.deletedAt !== null ? <FontAwesomeIcon icon={faTimesCircle} color="red" /> : <></>}
                        </td>
                      ) : (
                        <></>
                      )}
                      <td key={`output-list-${i}-name`}>{output.name}</td>
                      <td key={`output-list-${i}-template`}>
                        <Link to={`/users/${output.userId}/templates/${output.templateId}`}>
                          {output.template.name}
                        </Link>
                      </td>
                      <td key={`output-list-${i}-created`}>
                        <Timestamp value={output.createdAt} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default OutputsTable;
