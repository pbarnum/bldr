import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import Compiled from './pages/Compiled';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import Generate from './pages/Generate';
import Login from './pages/Login';
import NewPassword from './pages/NewPassword';
import Templates from './pages/Templates';
import Users from './pages/Users';
import Verify from './pages/Verify';

const rootElement = document.getElementById('root');
render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/password/forgot" element={<ForgotPassword />} />
          <Route path="/password/reset" element={<NewPassword />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:userId" element={<Users />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users/:userId/templates" element={<Templates />} />
          <Route path="/users/:userId/templates/:templateId" element={<Templates />} />
          <Route path="/users/:userId/generate" element={<Generate />} />
          <Route path="/users/:userId/generate/:templateId" element={<Generate />} />
          <Route path="/users/:userId/compiled" element={<Compiled />} />
          <Route path="/users/:userId/compiled/:outputId" element={<Compiled />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  rootElement
);
