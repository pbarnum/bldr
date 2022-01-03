import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import api from "../api";
import { AppContext, newSuccessAlert } from "../App";
import { ApiMessage } from "../types/api";

const Login = (): React.ReactElement => {
  const ctx = useOutletContext<AppContext>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const emailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const passwordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const submit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    api
      .login(email, password)
      .then((res) => {
        setPassword("");
        ctx.setAlert(newSuccessAlert("Successfully logged in!"));
        navigate(`/users/${res.user.id}`);
      })
      .catch((err: ApiMessage) => {
        ctx.setAlert(err);
      });
  };

  return (
    <>
      <h1>Login</h1>
      <form className="form form-control">
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="form-control"
            onChange={emailChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={passwordChange}
          />
        </div>
        <div className="d-flex justify-content-end">
          <button className="btn btn-primary" onClick={submit}>
            Login
          </button>
        </div>
      </form>
    </>
  );
};

export default Login;
