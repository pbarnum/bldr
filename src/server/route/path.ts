import { Path, Route } from "../domain/Path";

const uuid = "[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}";

const path = (url: string): Route => {
  const allRoutes: Path = {
    "^/health|ready$": {
      methods: ["GET"],
    },
    "^/login$": {
      methods: ["POST"],
    },
    "^/logout$": {
      methods: ["GET"],
    },
    "^/users$": {
      methods: ["POST", "GET"],
    },
    [`^/users/${uuid}$`]: {
      methods: ["GET", "PUT", "DELETE"],
    },
    [`^/users/${uuid}/restore$`]: {
      methods: ["PATCH"],
    },
    [`^/users/${uuid}/templates$`]: {
      methods: ["POST", "GET"],
    },
    [`^/users/${uuid}/templates/${uuid}$`]: {
      methods: ["GET", "PUT", "DELETE"],
    },
    [`^/users/${uuid}/templates/${uuid}/restore$`]: {
      methods: ["PATCH"],
    },
    [`^/users/${uuid}/templates/${uuid}/outputs$`]: {
      methods: ["POST", "GET"],
    },
    [`^/users/${uuid}/outputs$`]: {
      methods: ["GET"],
    },
    [`^/users/${uuid}/templates/${uuid}/outputs/${uuid}/download$`]: {
      methods: ["GET"],
    },
    [`^/users/${uuid}/templates/${uuid}/outputs/${uuid}$`]: {
      methods: ["GET", "DELETE"],
    },
    [`^/users/${uuid}/templates/${uuid}/outputs/${uuid}/restore$`]: {
      methods: ["PATCH"],
    },
  };

  return allRoutes[Object.keys(allRoutes).find((p) => url.match(p)) as string];
};

export default path;
