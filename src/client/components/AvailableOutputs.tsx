import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AppContext, newErrorAlert } from '../App';
import api from '../api';
import storage from '../storage';
import { ApiMessage, Pagination as PaginationObj } from '../types/api';
import { ListOutputsResp, Output } from '../types/output';
import OutputsTable from './OutputsTable';
import Pagination from './Pagination';
import Spinner from './Spinner';

export interface AvailableTemplatesProps {
  userId: string;
  selectedCallback?: (output: Output | null) => void;
}

const AvailableTemplates = (props: AvailableTemplatesProps): React.ReactElement => {
  const isAdmin = storage.isAdmin;
  const ctx: AppContext = useOutletContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [outputList, setOutputList] = useState<Output[]>([]);
  const [tablePagination, setTablePagination] = useState<PaginationObj>();
  const page = ctx.uri.page || 1;
  const limit = ctx.uri.limit || 5;
  const archived = ctx.uri.archived || false;

  useEffect(() => {
    const currentUser = ctx.user;
    if (!currentUser || !(currentUser.id === props.userId || storage.isAdmin)) {
      ctx.setAlert(newErrorAlert('You need to log in to view templates.'));
      return;
    }

    setLoading(true);

    api.output
      .listAllOutputs(props.userId, page, limit, archived === true)
      .then(({ outputs, pagination }: ListOutputsResp) => {
        setOutputList(outputs);
        setTablePagination(pagination);
        if (outputs.length === 0) {
          ctx.uri.setPage(1).save();
        }
      })
      .catch((err: ApiMessage) => {
        ctx.setAlert(newErrorAlert(err.message));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [props.userId, page, limit, archived]);

  const rowClick = (output: Output, isSelected: boolean) => {
    if (props.selectedCallback) {
      props.selectedCallback(isSelected ? output : null);
    }
  };

  return (
    <>
      <div className="row">
        <div className="col">
          <h3>Available Files</h3>
        </div>
      </div>
      <div className="row">
        <div className="col">
          {loading ? <Spinner /> : <OutputsTable isAdmin={isAdmin} outputList={outputList} onClick={rowClick} />}
        </div>
      </div>
      <div className="row">
        <div className="col">{tablePagination ? <Pagination pagination={tablePagination} /> : <></>}</div>
      </div>
    </>
  );
};

export default AvailableTemplates;
