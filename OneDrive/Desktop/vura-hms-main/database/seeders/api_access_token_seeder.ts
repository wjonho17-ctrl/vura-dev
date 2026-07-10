import ApiAccessToken from '#app/shared/api_access_token'
import env from '#start/env'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {

  async run() {
    // Write your database queries inside the run method
    await ApiAccessToken.create({
      name: env.get('API_TOKEN_NAME'),
      token: env.get('API_TOKEN'),
    })
  }
}

