import * as bcrypt from 'bcryptjs';
import {
  DataTypes,
  HasManyAddAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  Model,
  QueryTypes,
  Sequelize,
} from 'sequelize';
import Output from './output';
import Role from './role';
import Scope from './scope';
import Template from './template';

const saltRounds = 10;

class User extends Model {
  public id!: string;
  public firstName!: string;
  public lastName!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public loginAttempts!: number;
  public resetToken!: string | null;
  public verifyToken!: string | null;
  public verifiedAt!: Date | null;

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

  async mergeRoles(roles: Role[] | undefined): Promise<void> {
    if (!roles || roles.length === 0) {
      return;
    }

    await this.sequelize
      .query(
        {
          query: `
            DELETE FROM "user_roles"
            WHERE "userId" = ? AND "roleId" NOT IN (
              SELECT "id"
              FROM "roles"
              WHERE "name" = 'admin'
            )
          `,
          values: [this.id],
        },
        { type: QueryTypes.DELETE }
      )
      .catch(console.error);

    await this.sequelize
      .query(
        {
          query:
            `
            INSERT INTO "user_roles" ("userId", "roleId", "createdAt", "updatedAt")
            SELECT
              '${this.id}' AS "userId",
              "id" AS "roleId",
              CURRENT_TIMESTAMP AS "createdAt",
              CURRENT_TIMESTAMP AS "updatedAt"
            FROM "roles"
            WHERE "roles"."id" IN (` +
            '?'.repeat(roles.length).split('').join(',') +
            `)
          `,
          values: [...roles.map((r) => r.id)],
        },
        { type: QueryTypes.INSERT }
      )
      .catch(console.error);
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
          return !this.getDataValue('firstName') || !this.getDataValue('lastName')
            ? this.email
            : `${this.getDataValue('firstName')} ${this.getDataValue('lastName')}`;
        },
      },
      templateCount: {
        type: DataTypes.VIRTUAL,
        async get() {
          return (
            (await Template.count({
              where: { userId: this.getDataValue('id') },
            }).catch(console.error)) || 0
          );
        },
      },
      outputCount: {
        type: DataTypes.VIRTUAL,
        async get() {
          return (
            (await Output.count({
              where: { userId: this.getDataValue('id') },
            }).catch(console.error)) || 0
          );
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
          this.setDataValue('password', hash);
        },
      },
      loginAttempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      resetToken: {
        type: DataTypes.STRING,
        unique: true,
      },
      verifyToken: {
        type: DataTypes.STRING,
        unique: true,
      },
      verifiedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize: db,
      modelName: 'user',
      tableName: 'users',
      paranoid: true,
      defaultScope: {
        attributes: { exclude: ['password', 'loginAttempts'] },
      },
      scopes: {
        withPassword: {
          attributes: { include: ['password', 'loginAttempts'] },
        },
      },
    }
  );
};

export default User;
