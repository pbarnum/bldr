import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { AppContext, newSuccessAlert } from '../App';
import api from '../api';
import { ApiMessage } from '../types/api';

const ForgotPassword = (): React.ReactElement => {
  const ctx: AppContext = useOutletContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  useEffect(() => {
    document.title = 'Forgot Password - Bldr';
  }, []);

  const emailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const submit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    api.auth
      .resetPassword(email)
      .then(() => {
        ctx.setAlert(newSuccessAlert('Forgot Password submitted!'));
        navigate('/login');
      })
      .catch((err: ApiMessage) => {
        ctx.setAlert(err);
      });
  };

  return (
    <>
      <form className="form form-control">
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input type="email" id="email" className="form-control" value={email} onChange={emailChange} />
        </div>
        <div className="d-flex justify-content-end">
          <button className="btn btn-primary" onClick={submit}>
            Submit
          </button>
        </div>
      </form>
    </>
  );
};

export default ForgotPassword;
