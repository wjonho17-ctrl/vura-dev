import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import encryption from '@adonisjs/core/services/encryption'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Admin from './admin.js'

export default class AdminOtp extends BaseModel {
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
  declare adminId: string

  //#region relationships
  @belongsTo(() => Admin)
  declare admin: BelongsTo<typeof Admin>
  //#endregion
}
