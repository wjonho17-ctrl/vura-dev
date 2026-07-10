import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import encryption from '@adonisjs/core/services/encryption'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class UserOtp extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column({
    serializeAs: null,
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string) => encryption.decrypt(value),
  })
  declare code: string

  @column()
  declare userId: string

  //#region relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
  //#endregion
}
