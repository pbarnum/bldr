import { randomUUID } from "crypto";
import { Sequelize, QueryTypes } from "sequelize";
import Role from "./role";
import User from "./user";

export default async (db: Sequelize): Promise<void> => {
  await db
    .query(
      {
        query: `
          INSERT INTO "users" ("id", "firstName", "lastName", "email", "password", "createdAt", "updatedAt")
            VALUES
              (?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING;
        `,
        values: [
          randomUUID(),
          "Patrick",
          "Barnum",
          "admin@bldr.com",
          "$2a$10$Yu5xKpbAiROZl1gFWi/jxOCQhJjGp3Gw.zw/iWZXfSdYfwc5rVCS2",
          new Date(),
          new Date(),
        ],
      },
      { type: QueryTypes.INSERT }
    )
    .catch(console.error);

  const user = await User.findOne({
    where: { email: "patrickdbarnum@gmail.com" },
  }).catch(console.error);
  if (!user) {
    throw "no user";
  }

  const role = await Role.findOne({ where: { name: Role.Admin } }).catch(
    console.error
  );
  if (!role) {
    throw "no role";
  }

  await user.addRole(role).catch(console.error);
};
