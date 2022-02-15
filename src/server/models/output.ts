import { DataTypes, Model, Sequelize } from 'sequelize';

class Output extends Model {
  public id!: string;
  public userId!: string;
  public templateId!: string;
  public name!: string;
  public contents!: string;
  public amountReplaced!: number;
}

export const Init = (db: Sequelize): void => {
  Output.init(
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
      templateId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        validate: {
          len: [3, 64],
        },
        get() {
          return this.getDataValue('name').trim();
        },
        set(s: string) {
          this.setDataValue('name', s.trim());
        },
      },
      contents: {
        type: DataTypes.TEXT,
      },
      amountReplaced: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize: db,
      modelName: 'output',
      tableName: 'outputs',
      paranoid: true,
    }
  );
};

export default Output;
