import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_health_facilities'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('user_id').references('users.id')
      table.string('facility_id').references('health_facilities.id')
      table.string('creted_by').references('users.id').nullable()

      table.string('backoofice_user_id').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
