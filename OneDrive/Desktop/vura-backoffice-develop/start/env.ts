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
  DOMAIN: Env.schema.string(),

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
  DB_CONNECTION: Env.schema.enum(['sqlite', 'postgres'] as const),
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring database connection of medbook
  |----------------------------------------------------------
  */
  DB_MEDBOOK_HOST: Env.schema.string({ format: 'host' }),
  DB_MEDBOOK_PORT: Env.schema.number(),
  DB_MEDBOOK_USER: Env.schema.string(),
  DB_MEDBOOK_PASSWORD: Env.schema.string.optional(),
  DB_MEDBOOK_DATABASE: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring default admin user
  |----------------------------------------------------------
  */
  ADMIN_EMAIL: Env.schema.string({ format: 'email' }),
  ADMIN_FIRSTNAME: Env.schema.string(),
  ADMIN_LASTNAME: Env.schema.string(),
  ADMIN_PASSWORD: Env.schema.string(),

  MEDBOOK_AMDIN_API_DOMAIN: Env.schema.string(),

  MEDBOOK_ADMIN_API_TOKEN: Env.schema.string(),

  VURA_E_PRESCRIPTION_API_TOKEN: Env.schema.string(),

  E_PRESCRIPTION_API_LINK: Env.schema.string(),

  DB_E_PRESCRIPTION_HOST: Env.schema.string(),

  DB_E_PRESCRIPTION_PORT: Env.schema.number(),

  DB_E_PRESCRIPTION_USER: Env.schema.string(),

  DB_E_PRESCRIPTION_PASSWORD: Env.schema.string(),

  DB_E_PRESCRIPTION_DATABASE: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the drive package
  |----------------------------------------------------------
  */
  DRIVE_DISK: Env.schema.enum(['fs', 's3', 'e_prescription', 'medbook'] as const),
  AWS_ACCESS_KEY_ID: Env.schema.string(),
  AWS_SECRET_ACCESS_KEY: Env.schema.string(),
  AWS_REGION: Env.schema.string(),
  S3_BUCKET: Env.schema.string(),
  S3_ENPOINT: Env.schema.string(),

  E_PRESCRIPTION_MINIO_ACCESS_KEY_ID: Env.schema.string(),
  E_PRESCRIPTION_MINIO_SECRET_ACCESS_KEY: Env.schema.string(),
  E_PRESCRIPTION_MINIO_REGION: Env.schema.string(),
  E_PRESCRIPTION_MINIO_BUCKET: Env.schema.string(),
  E_PRESCRIPTION_MINIO_ENDPOINT: Env.schema.string(),

  MEDBOOK_MINIO_ACCESS_KEY_ID: Env.schema.string(),
  MEDBOOK_MINIO_SECRET_ACCESS_KEY: Env.schema.string(),
  MEDBOOK_MINIO_REGION: Env.schema.string(),
  MEDBOOK_MINIO_BUCKET: Env.schema.string(),
  MEDBOOK_MINIO_ENDPOINT: Env.schema.string(),

  VITE_APP_NAME: Env.schema.string(),
  VITE_DOMAIN: Env.schema.string(),
  VITE_MEDBOOK_DOMAIN: Env.schema.string(),
  VITE_E_PRESCRIPTION_API_LINK: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the mail package
  |----------------------------------------------------------
  */
  SMTP_HOST: Env.schema.string(),
  SMTP_PORT: Env.schema.string(),
  BREVO_API_KEY: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring Meilisearch Search Engine
  |----------------------------------------------------------
  */
  MEILISEARCH_HOST: Env.schema.string(),
  MEILISEARCH_API_KEY: Env.schema.string(),

  VITE_E_PRESCRIPTION_DOMAIN: Env.schema.string(),

  VITE_TRANSPORTER_APP_DOMAIN: Env.schema.string(),

  VITE_SENTRY_DSN: Env.schema.string(),

  SENTRY_DSN: Env.schema.string(),

  ADMIN_PHONE: Env.schema.string()
})
