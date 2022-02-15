import express from 'express';
import * as fs from 'fs';
import path from 'path';
import App from './App';
import { AppConfigs, Configs, Environments } from './domain/Configs';
import Database from './domain/Database';
import Email from './domain/Email';

// Configs =====================================================================
let configs: Configs;
try {
  configs = AppConfigs();
} catch (e) {
  console.error('failed to initialize app configs', e);
  process.exit(1);
}

// Emailer =====================================================================
const emailer = new Email(configs);

// Database ====================================================================
const db = new Database(configs);
db.initialize()
  .then(() => {
    // Initialize and Serve ========================================================
    const app = new App(configs, db, emailer);
    app.InitializeAndServe(express());
  })
  .catch(console.error);

// Inject env vars into frontend ===============================================
if (configs.app.env === Environments.Production) {
  setInterval(() => {
    const template = path.join(__dirname, '../public', '_index.html');
    const actual = path.join(__dirname, '../public', 'index.html');

    fs.readFile(template, (err, data) => {
      if (err) {
        console.error('failed to read template file:', err);
        return;
      }

      const templateString = data.toString('utf8').replace('{{SERVER_HOST}}', process.env.SERVER_HOST || '');

      fs.writeFile(actual, templateString, (err) => {
        if (err) {
          console.error('failed to write index file:', err);
        }
      });
    });
  }, 1000);
}
