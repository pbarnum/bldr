import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AppContext, newErrorAlert } from '../App';
import api from '../api';
import storage from '../storage';
import { ApiMessage, Pagination as PaginationObj } from '../types/api';
import { ListTemplatesResp, Template } from '../types/template';
import Pagination from './Pagination';
import Spinner from './Spinner';
import TemplatesTable from './TemplatesTable';

export interface AvailableTemplatesProps {
  userId: string;
  selectedCallback?: (template: Template | null) => void;
}

const AvailableTemplates = (props: AvailableTemplatesProps): React.ReactElement => {
  const isAdmin = storage.isAdmin;
  const ctx: AppContext = useOutletContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [templateList, setTemplateList] = useState<Template[]>([]);
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

    api.template
      .listTemplates(props.userId, page, limit, archived)
      .then(({ templates, pagination }: ListTemplatesResp) => {
        setTemplateList(templates);
        setTablePagination(pagination);
      })
      .catch((err: ApiMessage) => {
        ctx.setAlert(newErrorAlert(err.message));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [props.userId, page, limit, archived]);

  const rowClick = (template: Template, isSelected: boolean) => {
    if (props.selectedCallback) {
      props.selectedCallback(isSelected ? template : null);
    }
  };

  return (
    <>
      <div className="row">
        <div className="col">
          <h3>Available Templates</h3>
        </div>
      </div>
      <div className="row">
        <div className="col">
          {loading ? <Spinner /> : <TemplatesTable isAdmin={isAdmin} templateList={templateList} onClick={rowClick} />}
        </div>
      </div>
      <div className="row">
        <div className="col">{tablePagination ? <Pagination pagination={tablePagination} /> : <></>}</div>
      </div>
    </>
  );
};

export default AvailableTemplates;
