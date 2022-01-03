import {
  Model,
  Sequelize,
  DataTypes,
  QueryTypes,
  HasManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyHasAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
} from "sequelize";
import * as bcrypt from "bcryptjs";
import Role from "./role";
import Scope from "./scope";

const saltRounds = 10;

class User extends Model {
  public id!: string;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public password!: string;
  public loginAttempts!: number;

  comparePassword(p: string): boolean {
    return bcrypt.compareSync(p, this.password);
  }

  // public getScopes!: HasManyGetAssociationsMixin<Scope>;
  async getScopes(): Promise<Scope[]> {
    const scopes = await this.sequelize
      .query<Scope>(
        {
          query: `
            SELECT "s".*
            FROM "scopes" AS "s"
            INNER JOIN "role_scopes" AS "rs" ON "rs"."scopeId" = "s"."id"
            INNER JOIN "roles" AS "r" ON "r"."id" = "rs"."roleId"
            INNER JOIN "user_roles" AS "ur" ON "ur"."roleId" = "r"."id"
            WHERE "ur"."userId" = ?
          `,
          values: [this.id],
        },
        { type: QueryTypes.SELECT }
      )
      .catch(console.error);

    if (!scopes) {
      return [];
    }

    return scopes;
  }

  async hasScope(name: string): Promise<boolean> {
    const res = await this.sequelize
      .query(
        {
          query: `
            SELECT COUNT("s"."id")
            FROM "scopes" AS "s"
            INNER JOIN "role_scopes" AS "rs" ON "rs"."scopeId" = "s"."id"
            INNER JOIN "roles" AS "r" ON "r"."id" = "rs"."roleId"
            INNER JOIN "user_roles" AS "ur" ON "ur"."roleId" = "r"."id"
            WHERE "ur"."userId" = ? AND "s"."name" = ?
            LIMIT 1
          `,
          values: [this.id, name],
        },
        { type: QueryTypes.SELECT }
      )
      .catch(console.error);
    if (!res) {
      return false;
    }

    return res.length === 1;
  }

  async isAdmin(): Promise<boolean> {
    const roles = await this.getRoles().catch(console.error);
    if (!roles) {
      return false;
    }
    return roles.some((r) => r.name === Role.Admin);
  }

  public getRoles!: HasManyGetAssociationsMixin<Role>;
  public addRole!: HasManyAddAssociationMixin<Role, number>;
  public hasRole!: HasManyHasAssociationMixin<Role, number>;
  public countRoles!: HasManyCountAssociationsMixin;
  public createRole!: HasManyCreateAssociationMixin<Role>;
}

export const Init = (db: Sequelize): void => {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        validate: {
          isAlpha: true,
        },
      },
      lastName: {
        type: DataTypes.STRING,
        validate: {
          isAlpha: true,
        },
      },
      name: {
        type: DataTypes.VIRTUAL,
        get() {
          return !this.getDataValue("firstName") ||
            !this.getDataValue("lastName")
            ? this.email
            : `${this.getDataValue("firstName")} ${this.getDataValue(
                "lastName"
              )}`;
        },
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        set(val: string) {
          const hash = bcrypt.hashSync(val, saltRounds);
          this.setDataValue("password", hash);
        },
      },
      loginAttempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize: db,
      modelName: "user",
      tableName: "users",
      paranoid: true,
      defaultScope: {
        attributes: { exclude: ["password", "loginAttempts"] },
      },
      scopes: {
        withPassword: {
          attributes: { include: ["password", "loginAttempts"] },
        },
      },
    }
  );
};

export default User;
