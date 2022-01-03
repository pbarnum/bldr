import Role from "./role";
import Scope from "./scope";

export default async (): Promise<void> => {
  const userRoles = [
    Scope.GetUser,
    Scope.UpdateUser,
    Scope.CreateTemplate,
    Scope.GetTemplate,
    Scope.UpdateTemplate,
    Scope.ListTemplates,
    Scope.DeleteTemplate,
    Scope.CreateOutput,
    Scope.ListOutputs,
    Scope.GetOutput,
    Scope.DeleteOutput,
  ];
  const scopes = {
    [Role.Admin]: [
      ...userRoles,
      Scope.CreateUser,
      Scope.ListUsers,
      Scope.DeleteUser,
    ],
    [Role.User]: userRoles,
    [Role.Guest]: [],
  };

  // Save Scopes
  const savedScopes = await Scope.bulkCreate(
    scopes[Role.Admin].map((s) => ({ name: s })),
    { updateOnDuplicate: ["updatedAt"] }
  ).catch((err) => {
    console.error(err);
    throw err;
  });
  if (!savedScopes) {
    throw "nope";
  }

  const roles = [
    { name: Role.Admin },
    { name: Role.User },
    { name: Role.Guest },
  ];
  const savedRoles = await Role.bulkCreate(roles, {
    updateOnDuplicate: ["updatedAt"],
  }).catch((err) => {
    console.error(err);
    throw err;
  });

  await Promise.all(
    savedRoles.map((r) => {
      savedScopes
        .filter((s) => scopes[r.name].includes(s.name))
        .map((s) => {
          r.addScope(s);
        });
    })
  ).catch(console.error);
};
