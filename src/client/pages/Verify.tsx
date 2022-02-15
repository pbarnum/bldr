import React, { useEffect } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { AppContext, newErrorAlert, newSuccessAlert } from '../App';
import api from '../api';
import Spinner from '../components/Spinner';
import { ApiMessage } from '../types/api';

const Verify = (): React.ReactElement => {
  const ctx: AppContext = useOutletContext();
  const navigate = useNavigate();
  const [qp] = useSearchParams();
  const email = qp.get('email') || '';
  const token = qp.get('token') || '';

  useEffect(() => {
    document.title = 'Verify - Bldr';

    api.auth
      .verify(email, token)
      .then(({ user }) => {
        ctx.setAlert(newSuccessAlert('Email has been verified!'));
        console.log('reset password', `/password/reset?verified=true&token=${user.resetToken}&email=${user.email}`);
        if (user.resetToken !== null) {
          navigate(`/password/reset?verified=true&token=${user.resetToken}&email=${user.email}`);
          return;
        }
        navigate('/dashboard?verified=true');
      })
      .catch((err: ApiMessage) => {
        ctx.setAlert(newErrorAlert(err.message));
      });
  }, []);

  return (
    <>
      <h1>Verifying account...</h1>
      <Spinner />
    </>
  );
};

export default Verify;
