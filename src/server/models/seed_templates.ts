import { randomUUID } from 'crypto';
import { QueryTypes, Sequelize } from 'sequelize';
import User from './user';

const normal = (userId: string) => {
  const c = 'This is a {variable} template!';
  return [randomUUID(), userId, 'Template: Normal [test]', Buffer.byteLength(c, 'utf8'), c, new Date(), new Date()];
};

const long = (userId: string) => {
  const c = ','
    .repeat(999)
    .split(',')
    .map((v, i) => `The {var-${i}} is {var-${1000 + i}}!`)
    .join('\n');
  return [randomUUID(), userId, 'Template: Long [test]', Buffer.byteLength(c, 'utf8'), c, new Date(), new Date()];
};

const noVariables = (userId: string) => {
  const c = 'The template has no variables!';
  return [
    randomUUID(),
    userId,
    'Template: No Variables [test]',
    Buffer.byteLength(c, 'utf8'),
    c,
    new Date(),
    new Date(),
  ];
};

const onlyVariables = (userId: string) => {
  const c = '{variable1}{variable2}{variable3}';
  return [
    randomUUID(),
    userId,
    'Template: Only Variables [test]',
    Buffer.byteLength(c, 'utf8'),
    c,
    new Date(),
    new Date(),
  ];
};

const nonVariableBrackets = (userId: string) => {
  const c = 'The {noun} {verb}, {and its a good thing}!';
  return [
    randomUUID(),
    userId,
    'Template: Non-Variable brackets [test]',
    Buffer.byteLength(c, 'utf8'),
    c,
    new Date(),
    new Date(),
  ];
};

const emptyVariables = (userId: string) => {
  const c = 'This is an empty {} variable!';
  return [
    randomUUID(),
    userId,
    'Template: Empty Variables [test]',
    Buffer.byteLength(c, 'utf8'),
    c,
    new Date(),
    new Date(),
  ];
};

export default async (db: Sequelize): Promise<void> => {
  const user = await User.findOne({
    where: { email: 'admin@bldr.com' },
  }).catch(console.error);
  if (!user) {
    throw 'no user';
  }

  const testTemplates = await db
    .query<{ count: number }>(
      {
        query: `SELECT COUNT(*) AS "count"
                FROM "templates"
                WHERE "userId" = ?
                  AND "name" LIKE '%[test]'`,
        values: [user.id],
      },
      { type: QueryTypes.SELECT }
    )
    .catch(console.error);

  if (testTemplates && testTemplates.length === 1 && testTemplates[0].count > 0) {
    return;
  }

  const count = 109;
  const values = [];

  values.push(...normal(user.id));
  values.push(...long(user.id));
  values.push(...noVariables(user.id));
  values.push(...onlyVariables(user.id));
  values.push(...nonVariableBrackets(user.id));
  values.push(...emptyVariables(user.id));

  for (let i = Math.floor(values.length / 7); i < count; ++i) {
    const c = 'The {noun} is {verb}!';
    values.push(
      randomUUID(),
      user.id,
      `Template: ${randomUUID()} [test]`,
      Buffer.byteLength(c, 'utf8'),
      c,
      new Date(),
      new Date()
    );
  }

  await db
    .query(
      {
        query: `
          INSERT INTO "templates" ("id", "userId", "name", "size", "contents", "createdAt", "updatedAt")
            VALUES
              ${'(?, ?, ?, ?, ?, ?, ?),'.repeat(count).slice(0, -1)};
        `,
        values,
      },
      { type: QueryTypes.INSERT }
    )
    .catch(console.error);
};
