/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring session package
  |----------------------------------------------------------
  */
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory'] as const),

  /*
  |----------------------------------------------------------
  | Variables for configuring database connection
  |----------------------------------------------------------
  */
  DB_HOST: Env.schema.string(),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),

  CONTACT_EMAIL: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the mail package
  |----------------------------------------------------------
  */
  SMTP_DRIVER: Env.schema.enum(['smtp', 'brevo']),

  SMTP_HOST: Env.schema.string(),
  SMTP_PORT: Env.schema.string(),


  BREVO_SMTP_HOST: Env.schema.string(),
  BREVO_SMTP_PORT: Env.schema.string(),
  BREVO_SMTP_USERNAME: Env.schema.string(),
  BREVO_SMTP_PASSWORD: Env.schema.string(),

  EMAIL_NO_REPLY: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the jobs package
  |----------------------------------------------------------
  */
  REDIS_HOST: Env.schema.string(),
  REDIS_PORT: Env.schema.number(),
  REDIS_PASSWORD: Env.schema.string.optional(),
  REDIS_QUEUE: Env.schema.string.optional(),

  MEILISEARCH_HOST: Env.schema.string(),

  API_TOKEN_NAME: Env.schema.string(),
  API_TOKEN: Env.schema.string(),

  BROWESERLESS_LINK: Env.schema.string(),

  BROWESERLESS_TOKEN: Env.schema.string(),

  ALLOW_API_URL_LIST: Env.schema.string(),

  API_BACKOFFICE_TOKEN_NAME: Env.schema.string(),

  API_BACKOFFICE_TOKEN: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the drive package
  |----------------------------------------------------------
  */
  DRIVE_DISK: Env.schema.enum(['fs', 'minio'] as const),
  AWS_ACCESS_KEY_ID: Env.schema.string(),
  AWS_SECRET_ACCESS_KEY: Env.schema.string(),
  AWS_REGION: Env.schema.string(),
  S3_BUCKET: Env.schema.string(),
  S3_ENDPOINT: Env.schema.string(),

  VITE_MEILIISEARCH_SEARCH_KEY: Env.schema.string(),

  VITE_MEILLISEARCH_DOMAIN: Env.schema.string(),

  DOMAIN: Env.schema.string(),

  VITE_DOMAIN: Env.schema.string(),
})
