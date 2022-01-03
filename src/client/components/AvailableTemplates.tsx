import React, { useEffect, useState } from "react";
import TemplatesTable from "./TemplatesTable";
import Spinner from "./Spinner";
import { ApiMessage } from "../types/api";
import api from "../api";
import storage from "../storage";
import { AppContext, newErrorAlert } from "../App";
import { ListTemplatesResp, Template } from "../types/template";
import { useOutletContext } from "react-router-dom";

export interface AvailableTemplatesProps {
  userId: string;
  selectedCallback?: (template: Template | null) => void;
}

const AvailableTemplates = (
  props: AvailableTemplatesProps
): React.ReactElement => {
  const ctx: AppContext = useOutletContext();
  const [page] = useState(1);
  const [limit] = useState(25);
  // const [archived, setArchived] = useState(false);
  // const [pagination, setPagination] = useState<Pagination>();
  const [loading, setLoading] = useState<boolean>(true);
  const [templateList, setTemplateList] = useState<Template[]>([]);

  // const importTemplate = (e: React.MouseEvent<HTMLAnchorElement>) => {
  //   e.preventDefault();
  //   window.api.send(Global.Events.OpenFileDialog);
  // };

  // TODO: Add ability to make templates in app?
  // TODO: Ability to validate templates?
  // const validateAndSave = () => {};
  // const validate = () => {};
  // const save = () => {};

  useEffect(() => {
    const currentUser = ctx.user;
    if (!currentUser || !(currentUser.id === props.userId || storage.isAdmin)) {
      ctx.setAlert(newErrorAlert("You need to log in to view templates."));
      return;
    }

    api.template
      .listTemplates(props.userId, page, limit)
      .then((res: ListTemplatesResp) => {
        const { templates } = res;
        setTemplateList(templates);
        // setPagination(pagination);
      })
      .catch((err: ApiMessage) => {
        ctx.setAlert(newErrorAlert(err.message));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [props.userId]);

  const rowClick = (template: Template, isSelected: boolean) => {
    if (props.selectedCallback) {
      props.selectedCallback(isSelected ? template : null);
    }
  };

  return (
    <>
      <div className="row">
        <div className="col">
          {loading ? (
            <Spinner />
          ) : (
            <TemplatesTable templateList={templateList} onClick={rowClick} />
          )}
        </div>
      </div>
    </>
  );
};

export default AvailableTemplates;
