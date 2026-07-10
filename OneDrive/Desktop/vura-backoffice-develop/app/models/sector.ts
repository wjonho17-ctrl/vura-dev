import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Cell from './cell.js'
import District from './district.js'

export default class Sector extends BaseModel {
  static connection = 'medbook'

  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare name: string

  @column()
  declare districtId: number

  @column()
  declare longitude: number

  @column()
  declare latitude: number

  //#region relationships
  @belongsTo(() => District)
  declare district: BelongsTo<typeof District>

  @hasMany(() => Cell)
  declare cells: HasMany<typeof Cell>
  //#endregion
}
