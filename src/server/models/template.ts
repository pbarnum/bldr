import { Model, Sequelize, DataTypes } from "sequelize";
import Output from "./output";

const templateVariableRegex = new RegExp(/{[\w-]+}/, "mg");

class Template extends Model {
  public id!: string;
  public userId!: string;
  public name!: string;
  public contents!: string;
}

export const Init = (db: Sequelize): void => {
  Template.init(
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
      name: {
        type: DataTypes.STRING,
        validate: {
          len: [3, 64],
        },
        get() {
          return this.getDataValue("name").trim();
        },
        set(s: string) {
          this.setDataValue("name", s.trim());
        },
      },
      size: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      contents: {
        type: DataTypes.TEXT,
      },
      totalVariables: {
        type: DataTypes.VIRTUAL,
        get() {
          const matches = this.contents.match(templateVariableRegex);
          if (matches && matches.length > 0) {
            return matches.length;
          }
          return 0;
        },
      },
      uniqueVariables: {
        type: DataTypes.VIRTUAL,
        get() {
          const matches = this.contents.match(templateVariableRegex);
          if (matches && matches.length > 0) {
            return Object.keys(
              matches.reduce(
                (prev, cur) => Object.assign(prev, { [cur]: true }),
                {}
              )
            ).length;
          }
          return 0;
        },
      },
      outputCount: {
        type: DataTypes.VIRTUAL,
        async get() {
          const count: number | void = await Output.count({
            where: { templateId: this.id },
          }).catch(console.error);
          if (!count) {
            return 0;
          }
          return count;
        },
      },
    },
    {
      sequelize: db,
      modelName: "template",
      tableName: "templates",
      paranoid: true,
    }
  );
};

export default Template;
