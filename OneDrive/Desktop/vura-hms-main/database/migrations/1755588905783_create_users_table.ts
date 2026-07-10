import { UserRole } from '#app/shared/enums/user_enum'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()

      table.string('health_facility_id').notNullable().references('id').inTable('health_facilities').nullable().onDelete('SET NULL')

      table.string('firstname').nullable()
      table.string('lastname').nullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.string('phone', 13).notNullable().unique()
      table.boolean('is_online').defaultTo(true)
      table.boolean('is_active').defaultTo(true)
      table.string('regno')

      table.json('photo')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
