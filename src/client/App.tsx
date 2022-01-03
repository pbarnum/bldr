import React, { useEffect, useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import { ApiMessage } from "./types/api";
import Header from "./components/Header";
import NavDrawer from "./components/NavDrawer";
import "./styles/styles.scss";
import storage from "./storage";
import jwt, { JwtPayload } from "jwt-decode";
import { User } from "./types/user";
import Emitter from "./events";
import { events } from "./types/events";

const emptyMsg: ApiMessage = {
  type: "",
  message: "",
};

export interface AppContext {
  user?: User;
  setAlert: React.Dispatch<React.SetStateAction<ApiMessage>>;
}

export const newSuccessAlert = (message: string): ApiMessage => {
  return { type: "Success", message };
};

export const newErrorAlert = (message: string): ApiMessage => {
  return { type: "Error", message };
};

const App = (): React.ReactElement => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>();
  const [showAlert, setShowAlert] = useState(false);
  const [alert, setAlert] = useState<ApiMessage>(emptyMsg);
  const [toId, setToId] = useState(0);

  useEffect(() => {
    if (storage.user) {
      setUser(storage.user);
    }

    Emitter.on(events.loggedIn, (loggedInUser: User) => {
      setUser(loggedInUser);
    });
    Emitter.on(events.loggedOut, () => {
      console.log("App", "logged out");
      setUser(undefined);
    });
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      try {
        if (storage.token !== "") {
          const token = jwt(storage.token) as JwtPayload;
          if (token.exp && token.exp < new Date().getTime() / 1000) {
            storage.logout();
            setAlert(newErrorAlert("You have been logged out."));
            navigate("/login");
          }
        }
      } catch (e) {
        // silently fail
        console.error(e);
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!alert || !alert.message) {
      setShowAlert(false);
      return;
    }

    if (toId !== 0) {
      clearTimeout(toId);
    }

    setShowAlert(true);
    const id = setTimeout(() => {
      setShowAlert(false);
      setToId(0);
    }, 6000);
    setToId(id as unknown as number);

    return () => clearTimeout(id);
  }, [alert]);

  const toastType = (): string => {
    if (showAlert) {
      switch (alert.type.toLowerCase()) {
        case "success":
          return "info";
        case "bad request":
        case "error":
          return "danger";
        default:
          console.error("missing toast case: alert type is", `'${alert.type}'`);
          return "info";
      }
    }
    return "";
  };

  return (
    <>
      <Header />
      <div className="container-fluid px-0">
        <div className="row g-0 d-flex bldr-container">
          <div className="col-auto p-0 text-white d-none d-md-flex align-items-stretch">
            <NavDrawer user={user} />
          </div>
          <div className="col p-3">
            <div className="row">
              <div className="col">
                <Outlet context={{ user, setAlert }} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer className="p-3" position="bottom-end">
        <Toast
          bg={toastType()}
          animation={true}
          show={showAlert}
          onClose={() => setShowAlert(false)}
        >
          <Toast.Header>
            <img
              src="holder.js/20x20?text=%20"
              className="rounded me-2"
              alt=""
            />
            <strong className="me-auto">{alert.type}</strong>
          </Toast.Header>
          <Toast.Body>{alert.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default App;
