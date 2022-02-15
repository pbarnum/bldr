import { DataTypes, Model, Sequelize } from 'sequelize';

class UserLock extends Model {
  public id!: string;
  public email!: string;
}

export const Init = (db: Sequelize): void => {
  UserLock.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize: db,
      modelName: 'userLock',
      tableName: 'user_locks',
    }
  );
};

export default UserLock;
