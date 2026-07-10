import User from '#models/user'
import env from '#start/env'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  static environment = ['development', 'production']

  async run() {
    // Write your database queries inside the run method
    await User.create({
      email: env.get('ADMIN_EMAIL'),
      password: env.get('ADMIN_PASSWORD'),
      firstname: env.get('ADMIN_FIRSTNAME'),
      lastname: env.get('ADMIN_LASTNAME'),
      phone: env.get('ADMIN_PHONE')
    })
  }
}
