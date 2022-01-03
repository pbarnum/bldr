import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Link } from "react-router-dom";

export interface UnauthorizedProps {
  title: string;
  message: string;
}

const Unauthorized = (props: UnauthorizedProps): React.ReactElement => {
  return (
    <>
      <div className="row">
        <div className="col d-flex justify-content-center">
          <h3>{props.title}</h3>
        </div>
      </div>
      <div className="row">
        <div className="col d-flex justify-content-center">
          <FontAwesomeIcon icon={faTimesCircle} size="10x" color="red" />
        </div>
      </div>
      <div className="row">
        <div className="col d-flex justify-content-center">
          <h4>{props.message}</h4>
        </div>
      </div>
      <div className="row">
        <div className="col d-flex justify-content-center">
          <p>
            Please <Link to="/login">login</Link> to continue.
          </p>
        </div>
      </div>
    </>
  );
};

export default Unauthorized;
