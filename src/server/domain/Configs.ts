import Schema from "validate";

interface App {
  name: string;
}

const appValidationSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
});

interface Api {
  port: number;
}

const apiValidationSchema = new Schema({
  port: {
    type: Number,
    required: true,
    length: {
      min: 1,
    },
  },
});

interface Log {
  level: string;
}

const logValidationSchema = new Schema({
  level: {
    type: String,
    required: true,
    enum: ["info", "debug"],
  },
});

interface Jwt {
  privateKey: string;
  session: boolean;
}

const jwtValidationSchema = new Schema({
  privateKey: {
    type: String,
    required: true,
  },
  session: {
    type: Boolean,
    required: true,
  },
});

interface Database {
  host: string;
  port: number;
  user: string;
  pass: string;
  name: string;
  url: string;
  ssl: boolean;
}

const dbValidationSchema = new Schema({
  host: {
    type: String,
  },
  port: {
    type: Number,
    length: {
      min: 1,
    },
  },
  user: {
    type: String,
  },
  pass: {
    type: String,
  },
  name: {
    type: String,
  },
  url: {
    type: String,
  },
  ssl: {
    type: Boolean,
  },
});

export interface Configs {
  app: App;
  api: Api;
  log: Log;
  jwt: Jwt;
  db: Database;
}

export function AppConfigs(): Configs {
  let jwtSession = process.env.JWT_SESSION as string;
  if (!jwtSession) {
    jwtSession = "false";
  }

  let dbSsl = process.env.DB_SSL as string;
  if (!dbSsl) {
    dbSsl = "false";
  }

  const c = {
    app: {
      name: process.env.APP_NAME as string,
    },
    api: {
      port: Number(process.env.PORT || process.env.API_PORT),
    },
    log: {
      level: process.env.LOG_LEVEL as string,
    },
    jwt: {
      privateKey: (process.env.JWT_PRIVATE_KEY as string).replace(
        /\\n/gm,
        "\n"
      ),
      session: jwtSession === "1" || jwtSession.toLowerCase() === "true",
    },
    db: {
      host: process.env.DB_HOST as string,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER as string,
      pass: process.env.DB_PASS as string,
      name: process.env.DB_NAME as string,
      url: process.env.DATABASE_URL as string,
      ssl: dbSsl === "1" || dbSsl.toLowerCase() === "true",
    },
  };

  let errors = appValidationSchema.validate(c.app);
  if (errors.length > 0) {
    throw errors;
  }

  errors = apiValidationSchema.validate(c.api);
  if (errors.length > 0) {
    throw errors;
  }

  errors = logValidationSchema.validate(c.log);
  if (errors.length > 0) {
    throw errors;
  }

  errors = jwtValidationSchema.validate(c.jwt);
  if (errors.length > 0) {
    throw errors;
  }

  errors = dbValidationSchema.validate(c.db);
  if (errors.length > 0) {
    throw errors;
  }

  return c;
}
