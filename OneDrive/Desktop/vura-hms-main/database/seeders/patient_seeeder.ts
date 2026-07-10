import { PatientFactory } from '#database/factories/patient_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await PatientFactory.createMany(2)
  }
}

