import express from "express";
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
