import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'health_facilities'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()

      table.string('name').unique()
      table.integer('village_id')
      table.boolean('is_active').defaultTo(true)
      table.string('postal_box').nullable()
      table.string('phone').unique()
      table.string('phone_two').unique().nullable()
      table.string('email').unique()
      table.double('longitude')
      table.double('latitude')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
