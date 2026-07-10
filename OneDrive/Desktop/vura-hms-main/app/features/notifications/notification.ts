import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import { NotificationType } from '#app/shared/types/notification_type'
import NotificationFilter from './filters/notification_filter.js'
import { compose } from '@adonisjs/core/helpers'
import { Filterable } from 'adonis-lucid-filter'
import NotificationUser from './notification_user.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Notification extends compose(BaseModel, Filterable) {
  static $filter = () => NotificationFilter

  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare senderId: string

  @column()
  declare refId: string

  @column()
  declare type: NotificationType

  declare isRead: boolean

  @hasMany(() => NotificationUser)
  declare users: HasMany<typeof NotificationUser>

  @belongsTo(() => User, {
    localKey: 'senderId',
  })
  declare sender: BelongsTo<typeof User>

}

