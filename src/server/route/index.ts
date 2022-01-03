import express, { Router } from "express";
import { Configs } from "../domain/Configs";
import Database from "../domain/Database";
import Health from "../controller/health";
import Auth from "../controller/auth";
import Users from "../controller/users";
import Templates from "../controller/templates";
import Outputs from "../controller/outputs";
import { authenticate, errorHandler } from "../middlewares/auth";
import checkMethod from "../middlewares/checkMethod";
import logger from "../middlewares/logger";

export default (configs: Configs, db: Database): Router => {
  return express
    .Router()
    .use("*", logger(configs))
    .all("/api/v1/users*", authenticate(configs))
    .use(
      "/api/v1",
      checkMethod,
      Health(express.Router(), configs, db),
      Auth(express.Router(), configs),
      Users(express.Router()),
      Templates(express.Router()),
      Outputs(express.Router())
    )
    .use("*", errorHandler);
};
