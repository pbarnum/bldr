import {
  DataTypes,
  HasManyAddAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  Model,
  Sequelize,
} from 'sequelize';
import Scope from './scope';

class Role extends Model {
  static Admin = 'admin';
  static User = 'user';
  static Guest = 'guest';

  public id!: string;
  public name!: string;

  public getScopes!: HasManyGetAssociationsMixin<Scope>;
  public addScope!: HasManyAddAssociationMixin<Scope, number>;
  public hasScope!: HasManyHasAssociationMixin<Scope, number>;
  public countScopes!: HasManyCountAssociationsMixin;
  public createScope!: HasManyCreateAssociationMixin<Scope>;
  // static async refreshJwtScopes(): Promise<Scope[]> {
  //   const scopes = await Scope.findAll({
  //     include: [Role],
  //     where: { "role.name": Role.RefreshJwtRole },
  //   }).catch(console.error);

  //   if (!scopes) {
  //     return [];
  //   }

  //   return scopes;
  // }
}

export const Init = (db: Sequelize): void => {
  Role.init(
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
      modelName: 'role',
      tableName: 'roles',
    }
  );
};

export default Role;
