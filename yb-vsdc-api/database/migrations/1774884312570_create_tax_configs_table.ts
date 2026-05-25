import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tax_configs'

  async up() {
    const hasTable = await this.schema.hasTable(this.tableName)
    if (!hasTable) {
      await this.schema.createTable(this.tableName, (table) => {
        table.increments('id')
        table.string('tax_type', 2).notNullable().unique()
        table.float('rate').notNullable()
        table.float('divider').notNullable()
        table.boolean('is_active').defaultTo(true)
        table.timestamp('created_at')
        table.timestamp('updated_at')
      })
    }
  }

  async down() {
    this.schema.dropTableIfExists(this.tableName)
  }
}