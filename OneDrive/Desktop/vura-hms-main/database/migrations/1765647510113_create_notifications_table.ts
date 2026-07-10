import { NotificationType } from '#app/shared/types/notification_type'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.enum('type', Object.values(NotificationType)).notNullable()
      table.string('sender_id').references('users.id').notNullable()
      table.string('ref_id')
      table.boolean('is_read').defaultTo(false)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
