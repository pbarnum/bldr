import jwt, { JwtPayload } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import NavDrawer from './components/NavDrawer';
import NavHeader from './components/NavHeader';
import Emitter from './events';
import storage from './storage';
import './styles/styles.scss';
import { ApiMessage } from './types/api';
import { events } from './types/events';
import { User } from './types/user';
import Uri from './uri';

const emptyMsg: ApiMessage = {
  type: '',
  message: '',
};

export interface AppContext {
  user?: User;
  setAlert: React.Dispatch<React.SetStateAction<ApiMessage>>;
  uri: Uri;
}

export const newInfoAlert = (message: string): ApiMessage => {
  return { type: 'Notice', message };
};

export const newSuccessAlert = (message: string): ApiMessage => {
  return { type: 'Success', message };
};

export const newErrorAlert = (message: string): ApiMessage => {
  return { type: 'Error', message };
};

const App = (): React.ReactElement => {
  const navigate = useNavigate();
  const [qp, setQP] = useSearchParams();
  const [user, setUser] = useState<User>();
  const [showAlert, setShowAlert] = useState(false);
  const [alert, setAlert] = useState<ApiMessage>(emptyMsg);
  const [toId, setToId] = useState(0);

  const uri = new Uri(qp, setQP);

  useEffect(() => {
    if (storage.user) {
      setUser(storage.user);
    }

    Emitter.on(events.loggedIn, (loggedInUser: User) => {
      setUser(loggedInUser);
    });
    Emitter.on(events.loggedOut, () => {
      console.log('App', 'logged out');
      setUser(undefined);
    });
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      try {
        if (storage.token !== '') {
          const token = jwt(storage.token) as JwtPayload;
          if (token.exp && token.exp < new Date().getTime() / 1000) {
            storage.logout();
            setAlert(newErrorAlert('You have been logged out.'));
            navigate('/login');
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
        case 'info':
          return 'info';
        case 'success':
          return 'success';
        case 'bad request':
        case 'error':
          return 'danger';
        default:
          return 'info';
      }
    }
    return '';
  };

  const closeAlert = () => {
    clearTimeout(toId);
    setToId(0);
    setShowAlert(false);
  };

  return (
    <>
      <NavHeader />
      <div className="container-fluid px-0">
        <div className="row g-0 d-flex bldr-container">
          <div className="col-auto p-0 text-white d-none d-md-flex align-items-stretch">
            <NavDrawer user={user} />
          </div>
          <div className="col p-3">
            <div className="row">
              <div className="col">
                <Outlet context={{ user, setAlert, uri }} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer className="p-3 position-fixed" position="bottom-start">
        <Toast bg={toastType()} animation={true} show={showAlert} onClose={closeAlert}>
          <Toast.Header>
            <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
            <strong className="me-auto">{alert.type}</strong>
          </Toast.Header>
          <Toast.Body className={alert.type === 'Success' ? 'text-white' : ''}>{alert.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default App;
