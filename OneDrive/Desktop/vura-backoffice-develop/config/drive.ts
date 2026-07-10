import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, services } from '@adonisjs/drive'

const driveConfig = defineConfig({
  default: env.get('DRIVE_DISK'),

  /**
   * The services object can be used to configure multiple file system
   * services each using the same or a different driver.
   */
  services: {
    fs: services.fs({
      location: app.makePath('storage'),
      serveFiles: true,
      routeBasePath: '/uploads',
      visibility: 'public',
    }),
    s3: services.s3({
      credentials: {
        accessKeyId: env.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: env.get('AWS_SECRET_ACCESS_KEY'),
      },
      region: env.get('AWS_REGION'),
      bucket: env.get('S3_BUCKET'),
      visibility: 'private',
      forcePathStyle: true,
      endpoint: env.get('S3_ENDPOINT')
    }),
    e_prescription: services.s3({
      credentials: {
        accessKeyId: env.get('E_PRESCRIPTION_MINIO_ACCESS_KEY_ID'),
        secretAccessKey: env.get('E_PRESCRIPTION_MINIO_SECRET_ACCESS_KEY'),
      },
      region: env.get('E_PRESCRIPTION_MINIO_REGION'),
      bucket: env.get('E_PRESCRIPTION_MINIO_BUCKET'),
      visibility: 'private',
      forcePathStyle: true,
      endpoint: env.get('E_PRESCRIPTION_MINIO_ENDPOINT')
    }),
    medbook: services.s3({
      credentials: {
        accessKeyId: env.get('MEDBOOK_MINIO_ACCESS_KEY_ID'),
        secretAccessKey: env.get('MEDBOOK_MINIO_SECRET_ACCESS_KEY'),
      },
      region: env.get('MEDBOOK_MINIO_REGION'),
      bucket: env.get('MEDBOOK_MINIO_BUCKET'),
      visibility: 'private',
      forcePathStyle: true,
      endpoint: env.get('MEDBOOK_MINIO_ENDPOINT')
    }),
  },
})

export default driveConfig

declare module '@adonisjs/drive/types' {
  export interface DriveDisks extends InferDriveDisks<typeof driveConfig> { }
}