import express, { Router } from 'express';
import Auth from '../controller/auth';
import Health from '../controller/health';
import Outputs from '../controller/outputs';
import Templates from '../controller/templates';
import Users from '../controller/users';
import { Configs } from '../domain/Configs';
import Database from '../domain/Database';
import Email from '../domain/Email';
import { authenticate, errorHandler } from '../middlewares/auth';
import checkMethod from '../middlewares/checkMethod';
import logger from '../middlewares/logger';

export default (configs: Configs, db: Database, emailer: Email): Router => {
  return express
    .Router()
    .use('*', logger(configs))
    .all('/api/v1/users*', authenticate(configs))
    .use(
      '/api/v1',
      checkMethod,
      Health(express.Router(), configs, db),
      Auth(express.Router(), configs, emailer),
      Users(express.Router(), emailer),
      Templates(express.Router()),
      Outputs(express.Router())
    )
    .use('*', errorHandler);
};
