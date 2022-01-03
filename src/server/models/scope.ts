import {
  Model,
  Sequelize,
  DataTypes,
  HasManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyHasAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
} from "sequelize";
import Role from "./role";

class Scope extends Model {
  static CreateUser = "createUser";
  static UpdateUser = "updateUser";
  static ListUsers = "listUsers";
  static GetUser = "getUser";
  static DeleteUser = "deleteUser";
  static CreateTemplate = "createTemplate";
  static UpdateTemplate = "updateTemplate";
  static ListTemplates = "listTemplates";
  static GetTemplate = "getTemplate";
  static DeleteTemplate = "deleteTemplate";
  static CreateOutput = "createOutput";
  static ListOutputs = "listOutputs";
  static GetOutput = "getOutput";
  static DeleteOutput = "deleteOutput";

  public id!: string;
  public name!: string;

  public getRoles!: HasManyGetAssociationsMixin<Role>;
  public addRole!: HasManyAddAssociationMixin<Role, number>;
  public hasRole!: HasManyHasAssociationMixin<Role, number>;
  public countRoles!: HasManyCountAssociationsMixin;
  public createRole!: HasManyCreateAssociationMixin<Role>;
}

export const Init = (db: Sequelize): void => {
  Scope.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isAlpha: true,
        },
      },
    },
    {
      sequelize: db,
      modelName: "scope",
      tableName: "scopes",
    }
  );
};

export default Scope;
