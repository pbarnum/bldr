import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import { HTTPS } from 'express-sslify';
import path from 'path';
import { Configs, Environments } from './domain/Configs';
import Database from './domain/Database';
import Email from './domain/Email';
import { initialize as initializePassport } from './middlewares/auth';
import AppRouter from './route';

export default class App {
  private readonly configs: Configs;
  private readonly db: Database;
  private readonly emailer: Email;

  constructor(appConfigs: Configs, db: Database, emailer: Email) {
    this.configs = appConfigs;
    this.db = db;
    this.emailer = emailer;
  }

  InitializeAndServe(api: Express): void {
    // Global Middleware
    if (this.configs.app.env === Environments.Production) {
      api.use(HTTPS({ trustProtoHeader: true }));
    }

    api.use(cors());
    api.use(initializePassport(this.configs));
    api.use(express.urlencoded({ extended: true }));
    api.use(express.json());

    // Add Routes
    api.use(AppRouter(this.configs, this.db, this.emailer));

    // Serve Frontend
    api.use('/dist', express.static(path.join(__dirname, '../public')));
    api.get('/*', (req: Request, res: Response) => {
      // res.sendFile('/dist/index.html');
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    // Start Server
    // TODO: Add HTTPS
    api.listen(this.configs.api.port);
    console.log(`API listening on ${this.configs.api.port}`);
  }
}
