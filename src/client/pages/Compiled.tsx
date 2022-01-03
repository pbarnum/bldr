import React, { useState, useEffect } from "react";
import DisplayOutput from "../components/DisplayOutput";
import OutputsTable from "../components/OutputsTable";
import Spinner from "../components/Spinner";
import { ListOutputsResp, Output } from "../types/output";
import { AppContext, newErrorAlert } from "../App";
import { useOutletContext, useParams } from "react-router-dom";
import api from "../api";
import { ApiMessage } from "../types/api";
import Unauthorized from "../components/Unauthorized";
import storage from "../storage";

const Compiled = (): React.ReactElement => {
  const { userId } = useParams();
  const ctx: AppContext = useOutletContext();
  const [page] = useState(1);
  const [limit] = useState(25);
  // const [pagination, setPagination] = useState<Pagination>();
  const [loading, setLoading] = useState<boolean>(true);
  const [outputList, setOutputList] = useState<Output[]>([]);
  const [selectedOutput, setSelectedOutput] = useState<Output>();

  useEffect(() => {
    if (!userId) {
      return;
    }

    api.output
      .listAllOutputs(userId, page, limit)
      .then((res: ListOutputsResp) => {
        const { outputs } = res;
        setOutputList(outputs);
        // setPagination(pagination);
      })
      .catch((err: ApiMessage) => {
        ctx.setAlert(newErrorAlert(err.message));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  const selectedOutputHandler = (output: Output, isSelected: boolean) => {
    if (isSelected) {
      setSelectedOutput(output);
    }
  };

  if (!ctx.user || !userId) {
    return (
      <Unauthorized
        title="Unauthorized"
        message="You cannot view templates without being logged in!"
      />
    );
  }

  return (
    <>
      <div className="jumbotron">
        <h1 className="display-4">Compiled Files</h1>
        <p className="lead">Files that have been compiled successfully.</p>
        <hr className="my-4" />
      </div>
      <div className="row">
        <div className="col">
          {loading ? (
            <Spinner />
          ) : (
            <OutputsTable
              onClick={selectedOutputHandler}
              isAdmin={storage.isAdmin}
              outputList={outputList}
            />
          )}
        </div>
      </div>
      <hr className="my-4" />
      <div className="row">
        <div className="col">
          <DisplayOutput output={selectedOutput} />
        </div>
      </div>
    </>
  );
};

export default Compiled;
