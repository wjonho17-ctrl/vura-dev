import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'health_facilities'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('address')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('address')
    })
  }
}
