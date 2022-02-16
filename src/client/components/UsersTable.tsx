import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext } from 'react';
import { UserContext } from '../pages/Users';
import { User } from '../types/user';
import TableFilters from './TableFilters';
import Timestamp from './Timestamp';

export interface UsersTableProps {
  userList: User[];
}

const UsersTable = (props: UsersTableProps): React.ReactElement => {
  const { setUser } = useContext(UserContext);

  const rowClick = (user: User) => {
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

      e.currentTarget.classList.toggle('table-primary');
      setUser(user);
    };
  };

  return (
    <>
      {props.userList.length === 0 ? (
        <div className="d-flex justify-content-center">
          <h3>No Users Found</h3>
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
                <table className="table table-hover bldr-users-table">
                  <thead>
                    <tr>
                      <th>Archived</th>
                      <th>Name</th>
                      <th>Roles</th>
                      <th>Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {props.userList.map((u, i) => (
                      <tr key={`user-list-${i}`} onClick={rowClick(u)}>
                        <td key={`user-list-${i}-archived`}>
                          {u.deletedAt !== null ? <FontAwesomeIcon icon={faTimesCircle} color="red" /> : <></>}
                        </td>
                        <td key={`user-list-${i}-name`}>{u.name}</td>
                        <td key={`user-list-${i}-roles`}>
                          {u.roles.map((r, j) => (
                            <span key={j} className="badge bg-secondary me-1">
                              {r.name}
                            </span>
                          ))}
                        </td>
                        <td key={`user-list-${i}-created`}>
                          <Timestamp value={u.createdAt} />
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

export default UsersTable;
