import React, { useContext, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AppContext, newErrorAlert } from '../App';
import api from '../api';
import { UserContext } from '../pages/Users';
import storage from '../storage';
import { ApiMessage, Pagination as PaginationObj } from '../types/api';
import { ListUsersResp, User } from '../types/user';
import Pagination from './Pagination';
import Spinner from './Spinner';
import UsersTable from './UsersTable';

const AvailableUsers = (): React.ReactElement => {
  const ctx: AppContext = useOutletContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [userList, setUserList] = useState<User[]>([]);
  const [tablePagination, setTablePagination] = useState<PaginationObj>();
  const page = ctx.uri.page || 1;
  const limit = ctx.uri.limit || 5;
  const archived = ctx.uri.archived || false;
  const { user } = useContext(UserContext);

  useEffect(() => {
    setUserList(
      userList.map((u) => {
        if (user && user.id === u.id) {
          return Object.assign({}, user);
        }
        return u;
      })
    );
  }, [user]);

  useEffect(() => {
    if (!storage.isAdmin) {
      ctx.setAlert(newErrorAlert('You need to log in to view users.'));
      return;
    }

    setLoading(true);

    api.user
      .listUsers(page, limit, archived === true)
      .then((res: ListUsersResp) => {
        const { users, pagination } = res;
        setUserList(users);
        setTablePagination(pagination);
        if (users.length === 0) {
          ctx.uri.setPage(1).save();
        }
      })
      .catch((err: ApiMessage) => {
        ctx.setAlert(newErrorAlert(err.message));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page, limit, archived]);

  return (
    <>
      <div className="row">
        <div className="col">
          <h3>Registered Users</h3>
        </div>
      </div>
      <div className="row">
        <div className="col">{loading ? <Spinner /> : <UsersTable userList={userList} />}</div>
      </div>
      <div className="row">
        <div className="col">{tablePagination ? <Pagination pagination={tablePagination} /> : <></>}</div>
      </div>
    </>
  );
};

export default AvailableUsers;
