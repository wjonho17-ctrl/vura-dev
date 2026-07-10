import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await User.createMany([
      {
        email: 'test2@test.com',
        password: 'test',
        firstname: 'test2',
        lastname: 'test2',
        phone: '+2507800764111'
      },
    ])
  }
}
