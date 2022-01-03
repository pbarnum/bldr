import React from "react";
import { render } from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Templates from "./pages/templates";
import Generate from "./pages/generate";
import Compiled from "./pages/compiled";

const rootElement = document.getElementById("root");
render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="login" element={<Login />} />
          {/* <Route path="users" element={<Users />} /> */}
          <Route path="users/:userId" element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users/:userId/templates" element={<Templates />} />
          <Route
            path="users/:userId/templates/:templateId"
            element={<Templates />}
          />
          <Route path="users/:userId/generate" element={<Generate />} />
          <Route path="users/:userId/compiled" element={<Compiled />} />
          {/* <Route path="generate" element={<Generate />} />
          <Route path="compiled" element={<Compiled />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  rootElement
);
