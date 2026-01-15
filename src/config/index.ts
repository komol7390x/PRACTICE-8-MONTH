import * as dotenv from 'dotenv';

dotenv.config();

interface IConfig {
  PORT: number;
  NODE_ENV: string;
  APP_VERSION: string,
  SWAGGER: {
    PASSWORD: string
  }
  TOKEN: {
    ACCESS_TOKEN_KEY: string;
    ACCESS_TOKEN_TIME: number;
  };

  SUPER_ADMIN: {
    USERNAME: string;
    PASSWORD: string;
    FULLNAME: string;
  };
  DATABASE: {
    PORT: number,
    NAME: string,
    USER: string,
    HOST: string,
    PASS: string
  },
  FRONT: {
    URL: string
  }
  BECKEND: {
    URL: string
  }
  GOOGLE: {
    ID: String,
    SECRET_KEY: String,
    CALLBACK_URL: String
    JWT_SECRET: String
  }
  UPLOAD_FOLDER: string;
  TELEGRAM_BOT_TOKEN: string;
}

export const appConfig: IConfig = {
  PORT: Number(process.env.PORT),
  NODE_ENV: String(process.env.NODE_ENV),
  APP_VERSION: String(process.env.APP_VERSION),
  SWAGGER: {
    PASSWORD: String(process.env.SWAGGER_PASSWORD),
  },
  FRONT: {
    URL: process.env.NODE_ENV === 'production'
      ? String(process.env.FRONT_URL_SERVER)
      : String(process.env.FRONT_URL_LOCAL),
  },
  BECKEND: {
    URL: process.env.NODE_ENV === 'production'
      ? String(process.env.BECKEND_URL_SERVER)
      : String(process.env.BECKEND_URL_LOCAL),
  },
  TOKEN: {
    ACCESS_TOKEN_KEY: String(process.env.TOKEN_ACCESS_TOKEN_KEY),
    ACCESS_TOKEN_TIME: Number(process.env.TOKEN_ACCESS_TOKEN_TIME),
  },

  SUPER_ADMIN: {
    USERNAME: String(process.env.SUPER_ADMIN_USERNAME),
    PASSWORD: String(process.env.SUPER_ADMIN_PASSWORD),
    FULLNAME: String(process.env.SUPER_ADMIN_FULLNAME),
  },
  DATABASE: {
    PORT: Number(process.env.DB_PORT),
    NAME: String(process.env.DB_NAME),
    USER: String(process.env.DB_USER),
    HOST: String(process.env.DB_HOST),
    PASS: String(process.env.DB_PASS)

  },
  GOOGLE: {
    ID: String(process.env.GOOGLE_CLIENT_ID),
    SECRET_KEY: String(process.env.GOOGLE_CLIENT_SECRET),
    CALLBACK_URL: String(process.env.GOOGLE_CALLBACK_URL),
    JWT_SECRET: String(process.env.JWT_SECRET)
  },
  UPLOAD_FOLDER: String(process.env.UPLOAD_FOLDER),
  TELEGRAM_BOT_TOKEN: String(process.env.TELEGRAM_BOT_TOKEN)
};
