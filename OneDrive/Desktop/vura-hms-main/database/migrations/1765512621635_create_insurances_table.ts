import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'insurances'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .string('health_facilitiy_id')
        .notNullable()
        .references('id')
        .inTable('health_facilities')
        .onDelete('CASCADE')

      table.string('name')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

