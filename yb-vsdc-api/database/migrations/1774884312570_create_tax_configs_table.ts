import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tax_configs'

  async up() {
    // Table already exists, skip migration
    return
  }

  async down() {
    this.schema.dropTableIfExists(this.tableName)
  }
}