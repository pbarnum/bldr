import { Sequelize } from "sequelize";
import { Configs } from "./Configs";
import models from "../models";
import seedScopesAndRoles from "../models/seed_roles_scopes";
import seedUsers from "../models/seed_users";

export default class Database {
  private readonly db: Sequelize;

  constructor(c: Configs) {
    const url = c.db.url
      ? c.db.url
      : `postgres://${c.db.user}:${c.db.pass}@${c.db.host}:${c.db.port}/${c.db.name}`;
    this.db = new Sequelize(url, {
      dialect: "postgres",
      dialectOptions: {
        ssl: c.db.ssl,
      },
    });
  }

  async initialize() {
    await this.loadModels();
    await this.seed();
  }

  private async loadModels(): Promise<void> {
    models(this.conn);
    await this.db.sync({ alter: true }).catch(console.error);
  }

  private async seed(): Promise<void> {
    await seedScopesAndRoles();
    await seedUsers(this.db);
  }

  get conn(): Sequelize {
    return this.db;
  }

  async connected(): Promise<boolean> {
    try {
      await this.db.authenticate();
      return true;
    } catch (e) {
      console.error(e);
    }
    return false;
  }
}
