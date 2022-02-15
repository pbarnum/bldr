import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { AppContext, newErrorAlert, newSuccessAlert } from '../App';
import api from '../api';
import { ApiMessage } from '../types/api';

const NewPassword = (): React.ReactElement => {
  const ctx: AppContext = useOutletContext();
  const navigate = useNavigate();
  const [qp] = useSearchParams();
  const [hint, setHint] = useState<boolean>(false);
  const [notConfirmed, setNotConfirmed] = useState<boolean>(false);
  const [email] = useState(qp.get('email') || '');
  const [token] = useState(qp.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    document.title = 'New Password - Bldr';
  }, []);

  const passwordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const confirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const passwordRules = (p: string): boolean => {
    return p.match(/^^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/) !== null;
  };

  const passwordMatch = (p: string, c: string): boolean => {
    return p === c;
  };

  const submit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setHint(false);
    setNotConfirmed(false);

    if (!passwordRules(password)) {
      setHint(true);
      ctx.setAlert(newErrorAlert("Failed to update User. Password doesn't meet criteria."));
      return;
    }

    if (!passwordMatch(password, confirmPassword)) {
      setNotConfirmed(true);
      ctx.setAlert(newErrorAlert("Failed to update User. Password confirmation doesn't match."));
      return;
    }

    api.auth
      .changePassword(token, email, password, confirmPassword)
      .then(() => {
        ctx.setAlert(newSuccessAlert('Password updated!'));
        navigate('/login');
      })
      .catch((err: ApiMessage) => {
        ctx.setAlert(err);
      });
  };

  return (
    <>
      <form className="form form-control">
        <input type="hidden" id="email" value={email} />
        <input type="hidden" id="token" value={token} />
        <div className="mb-3">
          <div className={`alert alert-danger ${hint ? '' : 'd-none'}`}>
            <h4>Password Criteria</h4>
            <ul>
              <li>Must be at least 6 characters long</li>
              <li>Must contain letters, numbers, and special characters</li>
            </ul>
          </div>
          <label htmlFor="password" className={`form-label ${hint ? 'is-invalid' : ''}`}>
            New Password
          </label>
          <input
            type="password"
            id="password"
            className={`form-control ${hint ? 'is-invalid' : ''}`}
            value={password}
            onChange={passwordChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="confirmPassword" className={`form-label ${notConfirmed ? 'is-invalid' : ''}`}>
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            className={`form-control ${notConfirmed ? 'is-invalid' : ''}`}
            value={confirmPassword}
            onChange={confirmPasswordChange}
          />
        </div>
        <div className="d-flex justify-content-end">
          <button className="btn btn-primary" onClick={submit}>
            Reset Password
          </button>
        </div>
      </form>
    </>
  );
};

export default NewPassword;
