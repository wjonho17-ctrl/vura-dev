import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'prescriptions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table
        .string('patient_id')
        .notNullable()
        .references('id')
        .inTable('patients')
        .nullable()
        .onDelete('SET NULL')

      table
        .string('health_facility_id')
        .notNullable()
        .references('id')
        .inTable('health_facilities')
        .onDelete('CASCADE')

      table
        .integer('insurance_id')
        .notNullable()
        .references('id')
        .inTable('insurances')
        .nullable()
        .onDelete('SET NULL')

      table.string('patient_name')
      table.string('patient_phone')
      table.string('patient_genre')
      table.string('patient_weight')
      table.integer('age')

      table.date('treatment_date')

      table.string('code')
      table.date('dispense_date')
      table.integer('duration_days')

      table.json('products').defaultTo({ data: [] })

      table.json('pharmacy_history').defaultTo({ data: [] })

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

