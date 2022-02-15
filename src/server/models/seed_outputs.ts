import { randomUUID } from 'crypto';
import { QueryTypes, Sequelize } from 'sequelize';
import User from './user';

const normal = (userId: string, templateId: string, templateName: string) => [
  randomUUID(),
  userId,
  templateId,
  templateName.replace('Template', 'Output'),
  'The output is generated!',
  2,
  new Date(),
  new Date(),
];

const long = (userId: string, templateId: string, templateName: string) => [
  randomUUID(),
  userId,
  templateId,
  templateName.replace('Template', 'Output'),
  ','
    .repeat(999)
    .split(',')
    .map((v, i) => `The variable-${i} is changed-${1000 + i}!`)
    .join('\n'),
  2000,
  new Date(),
  new Date(),
];

const noVariables = (userId: string, templateId: string, templateName: string) => [
  randomUUID(),
  userId,
  templateId,
  templateName.replace('Template', 'Output'),
  'The template has no variables!',
  0,
  new Date(),
  new Date(),
];

const onlyVariables = (userId: string, templateId: string, templateName: string) => [
  randomUUID(),
  userId,
  templateId,
  templateName.replace('Template', 'Output'),
  'replacedthevariable',
  3,
  new Date(),
  new Date(),
];

const nonVariableBrackets = (userId: string, templateId: string, templateName: string) => [
  randomUUID(),
  userId,
  templateId,
  templateName.replace('Template', 'Output'),
  'The clock ticks, {and its a good thing}!',
  2,
  new Date(),
  new Date(),
];

const emptyVariables = (userId: string, templateId: string, templateName: string) => [
  randomUUID(),
  userId,
  templateId,
  templateName.replace('Template', 'Output'),
  'This is an empty {} variable!',
  0,
  new Date(),
  new Date(),
];

interface Row {
  id: string;
  name: string;
}

export default async (db: Sequelize): Promise<void> => {
  const user = await User.findOne({
    where: { email: 'admin@bldr.com' },
  }).catch(console.error);
  if (!user) {
    throw 'no user';
  }

  const templates = await db
    .query<Row>(`SELECT "id", "name" FROM "templates" WHERE "name" LIKE '%[test]'`, { type: QueryTypes.SELECT })
    .catch(console.error);
  if (!templates) {
    throw 'no test templates';
  }

  const testOutputs = await db
    .query<{ count: number }>(
      {
        query: `SELECT COUNT(*) AS "count"
                FROM "outputs"
                WHERE "userId" = ?
                  AND "templateId" IN (
                    SELECT "id"
                    FROM "templates"
                    WHERE "name" LIKE '%[test]'
                  )`,
        values: [user.id],
      },
      { type: QueryTypes.SELECT }
    )
    .catch(console.error);

  if (testOutputs && testOutputs.length === 1 && testOutputs[0].count > 0) {
    return;
  }

  const values: unknown[] = [];
  templates.map((row) => {
    switch (row.name) {
      case 'Template: Normal [test]':
        values.push(...normal(user.id, row.id, row.name));
        break;
      case 'Template: Long [test]':
        values.push(...long(user.id, row.id, row.name));
        break;
      case 'Template: No Variables [test]':
        values.push(...noVariables(user.id, row.id, row.name));
        break;
      case 'Template: Only Variables [test]':
        values.push(...onlyVariables(user.id, row.id, row.name));
        break;
      case 'Template: Non-Variable brackets [test]':
        values.push(...nonVariableBrackets(user.id, row.id, row.name));
        break;
      case 'Template: Empty Variables [test]':
        values.push(...emptyVariables(user.id, row.id, row.name));
        break;
      default:
        values.push(
          randomUUID(),
          user.id,
          row.id,
          row.name.replace('Template', 'Output'),
          `The output is generated!`,
          2,
          new Date(),
          new Date()
        );
    }
  });

  await db
    .query(
      {
        query: `
          INSERT INTO "outputs" (
            "id",
            "userId",
            "templateId",
            "name",
            "contents",
            "amountReplaced",
            "createdAt",
            "updatedAt"
          )
            VALUES
              ${'(?, ?, ?, ?, ?, ?, ?, ?),'.repeat(templates.length).slice(0, -1)};
        `,
        values,
      },
      { type: QueryTypes.INSERT }
    )
    .catch(console.error);
};
