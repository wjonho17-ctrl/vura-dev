import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'
import { readFileSync } from 'fs'

const dbConfig = defineConfig({
  connection: env.get('DB_CONNECTION'),
  connections: {
    medbook: {
      client: 'pg',
      connection: {
        host: env.get('DB_MEDBOOK_HOST'),
        port: env.get('DB_MEDBOOK_PORT'),
        user: env.get('DB_MEDBOOK_USER'),
        password: env.get('DB_MEDBOOK_PASSWORD'),
        database: env.get('DB_MEDBOOK_DATABASE'),
      },
    },
    e_prescription: {
      client: 'pg',
      connection: {
        host: env.get('DB_E_PRESCRIPTION_HOST'),
        port: env.get('DB_E_PRESCRIPTION_PORT'),
        user: env.get('DB_E_PRESCRIPTION_USER'),
        password: env.get('DB_E_PRESCRIPTION_PASSWORD'),
        database: env.get('DB_E_PRESCRIPTION_DATABASE'),
      },
    },
    postgres: {
      client: 'pg',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig
