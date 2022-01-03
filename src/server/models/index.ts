import { Sequelize } from "sequelize/dist";
import Role, { Init as RoleInit } from "./role";
import Scope, { Init as ScopeInit } from "./scope";
import User, { Init as UserInit } from "./user";
import UserLock, { Init as UserLockInit } from "./userlock";
import Template, { Init as TemplateInit } from "./template";
import Output, { Init as OutputInit } from "./output";

export default (db: Sequelize): void => {
  ScopeInit(db);
  RoleInit(db);
  UserInit(db);
  UserLockInit(db);
  TemplateInit(db);
  OutputInit(db);

  // Roles and Scopes
  Scope.belongsToMany(Role, { through: "role_scopes" });
  Role.belongsToMany(Scope, { through: "role_scopes" });

  // User Roles and Scopes
  Role.belongsToMany(User, { through: "user_roles" });
  User.belongsToMany(Role, { through: "user_roles" });

  // User lock
  UserLock.belongsTo(User, { targetKey: "id" });
  User.hasOne(UserLock, {
    sourceKey: "id",
    foreignKey: "userId",
    as: "userLock",
  });

  // User Templates
  User.hasMany(Template, {
    sourceKey: "id",
    foreignKey: "userId",
    as: "templates",
  });
  Template.belongsTo(User, { targetKey: "id" });

  // User Outputs
  User.hasMany(Output, {
    sourceKey: "id",
    foreignKey: "userId",
    as: "outputs",
  });
  Output.belongsTo(User, { targetKey: "id" });

  Template.hasMany(Output, {
    sourceKey: "id",
    foreignKey: "templateId",
    as: "outputs",
  });
  Output.belongsTo(Template, { targetKey: "id" });
};
