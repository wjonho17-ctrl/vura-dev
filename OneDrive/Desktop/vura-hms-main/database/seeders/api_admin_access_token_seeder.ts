import ApiAccessToken from '#app/shared/api_access_token'
import ApiAdminAccessToken from '#app/shared/api_admin_access_token'
import env from '#start/env'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {

  async run() {
    // Write your database queries inside the run method
    await ApiAdminAccessToken.create({
      name: env.get('API_BACKOFFICE_TOKEN_NAME'),
      token: env.get('API_BACKOFFICE_TOKEN'),
    })
  }
}

