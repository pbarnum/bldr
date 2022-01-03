import { faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const Spinner = (): React.ReactElement => {
  return (
    <div className="d-flex flex-column align-items-center">
      <h4>Loading...</h4>
      <p>
        <FontAwesomeIcon size="3x" spin={true} icon={faCog} />
      </p>
    </div>
  );
};

export default Spinner;
