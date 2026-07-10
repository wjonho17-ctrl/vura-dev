import { HospitalPosition, MedicalSpecialty, UserRole } from '#app/shared/enums/user_enum'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('role', Object.values(UserRole)).notNullable()
      table.enum('position', Object.values(HospitalPosition)).notNullable()
      table.json('specialities').defaultTo({data: []})
      table.enum('genre', ['M', 'F']).notNullable()
    })
  }
  
  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('role')
      table.dropColumn('genre')
    })
  }
}
