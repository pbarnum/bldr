import Schema from 'validate';

export enum Environments {
  Production = 'prod',
  Local = 'local',
}

interface App {
  name: string;
  env: string;
}

const appValidationSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  env: {
    type: String,
    required: true,
    enum: [Environments.Production, Environments.Local],
  },
});

interface Api {
  host: string;
  port: number;
}

const apiValidationSchema = new Schema({
  host: {
    type: String,
    required: true,
  },
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
    enum: ['info', 'debug'],
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

interface EmailAuth {
  user: string;
  pass: string;
}

interface Emailer {
  name: string;
  email: string;
}

export interface Email {
  host: string;
  port: number;
  auth: EmailAuth;
  system: Emailer;
}

const emailSchema = new Schema({
  host: {
    type: String,
  },
  port: {
    type: Number,
    length: {
      min: 1,
    },
  },
  auth: {
    user: {
      type: String,
    },
    pass: {
      type: String,
    },
  },
  system: {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
  },
});

export interface Configs {
  app: App;
  api: Api;
  log: Log;
  jwt: Jwt;
  db: Database;
  email: Email;
}

export function AppConfigs(): Configs {
  let jwtSession = process.env.JWT_SESSION as string;
  if (!jwtSession) {
    jwtSession = 'false';
  }

  let dbSsl = process.env.DB_SSL as string;
  if (!dbSsl) {
    dbSsl = 'false';
  }

  const key = (process.env.JWT_PRIVATE_KEY as string).replace('"', '').replace(/\\n/gm, '\n');

  const c = {
    app: {
      name: process.env.APP_NAME as string,
      env: process.env.APP_ENV as string,
    },
    api: {
      host: process.env.SERVER_HOST as string,
      port: Number(process.env.PORT || process.env.API_PORT),
    },
    log: {
      level: process.env.LOG_LEVEL as string,
    },
    jwt: {
      privateKey: key,
      session: jwtSession === '1' || jwtSession.toLowerCase() === 'true',
    },
    db: {
      host: process.env.DB_HOST as string,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER as string,
      pass: process.env.DB_PASS as string,
      name: process.env.DB_NAME as string,
      url: process.env.DATABASE_URL as string,
      ssl: dbSsl === '1' || dbSsl.toLowerCase() === 'true',
    },
    email: {
      host: process.env.EMAIL_HOST as string,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_AUTH_USER as string,
        pass: process.env.EMAIL_AUTH_PASS as string,
      },
      system: {
        name: process.env.EMAIL_SYSTEM_NAME as string,
        email: process.env.EMAIL_SYSTEM_EMAIL as string,
      },
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

  errors = emailSchema.validate(c.email);
  if (errors.length > 0) {
    throw errors;
  }

  return c;
}
