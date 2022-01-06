import express, { Request, Response, Express } from "express";
import { initialize as initializePassport } from "./middlewares/auth";
import { Configs } from "./domain/Configs";
import Database from "./domain/Database";
import AppRouter from "./route";
// import { NotFound } from "./domain/Response";
import path from "path";

export default class App {
  private readonly configs: Configs;
  private readonly db: Database;

  constructor(appConfigs: Configs, db: Database) {
    this.configs = appConfigs;
    this.db = db;
  }

  InitializeAndServe(api: Express): void {
    // Global Middleware
    api.use(initializePassport(this.configs));
    api.use(express.urlencoded({ extended: true }));
    api.use(express.json());

    api.use("*", (req: Request, res: Response) => {
      if (req.protocol !== "https:") {
        res.redirect(req.url.replace(req.protocol, "https:"));
      }
    });

    // Add Routes
    api.use(AppRouter(this.configs, this.db));

    // Serve Frontend
    api.use("/dist", express.static(path.join(__dirname, "../public")));
    api.get("/*", (req: Request, res: Response) => {
      // res.sendFile("/dist/index.html");
      res.sendFile(path.join(__dirname, "../public/index.html"));
    });

    // api.use("*", (req: Request, res: Response) => {
    //   console.error("path not found", req.path);
    //   NotFound(res);
    // });

    // Start Server
    // TODO: Add HTTPS
    api.listen(this.configs.api.port);
    console.log(`API listening on ${this.configs.api.port}`);
  }
}
