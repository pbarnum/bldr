import express from "express";
import * as fs from "fs";
import path from "path";
import Database from "./domain/Database";
import { AppConfigs, Configs } from "./domain/Configs";
import App from "./App";

// Configs =====================================================================
let configs: Configs;
try {
  configs = AppConfigs();
} catch (e) {
  console.error("failed to initialize app configs", e);
  process.exit(1);
}

// Database ====================================================================
const db = new Database(configs);
db.initialize()
  .then(() => {
    // Initialize and Serve ========================================================
    const app = new App(configs, db);
    app.InitializeAndServe(express());
  })
  .catch(console.error);

// Inject env vars into frontend ===============================================
if (process.env.NODE_ENV === "production") {
  setInterval(() => {
    const template = path.join(__dirname, "../public", "_index.html");
    const actual = path.join(__dirname, "../public", "index.html");

    fs.readFile(template, (err, data) => {
      if (err) {
        console.error("failed to read template file:", err);
        return;
      }

      const templateString = data
        .toString("utf8")
        .replace("{{SERVER_HOST}}", process.env.SERVER_HOST || "")
        .replace("{{SERVER_PORT}}", process.env.PORT || "");

      fs.writeFile(actual, templateString, (err) => {
        if (err) {
          console.error("failed to write index file:", err);
        }
      });
    });
  }, 1000);
}
