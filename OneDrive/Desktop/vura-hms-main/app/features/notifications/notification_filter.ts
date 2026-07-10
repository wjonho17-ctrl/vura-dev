
import { BaseModelFilter } from 'adonis-lucid-filter'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import Notification from '#app/features/notifications/notification'

export default class NotificationFilter extends BaseModelFilter {
  declare $query: ModelQueryBuilderContract<typeof Notification>

  name(value: string): void {
    this.$query.where('name', value)
  }
}
