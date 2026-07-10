import { HealthFacilityFactory } from '#database/factories/health_facility_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {

  async run() {
    await HealthFacilityFactory.with('users').createMany(2)
  }
}

