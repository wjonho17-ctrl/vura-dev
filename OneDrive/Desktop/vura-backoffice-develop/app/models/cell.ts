import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Sector from './sector.js'
import Village from './village.js'

export default class Cell extends BaseModel {
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
  declare sectorId: number

  @column()
  declare longitude: number

  @column()
  declare latitude: number

  //#region relationships
  @belongsTo(() => Sector)
  declare sector: BelongsTo<typeof Sector>

  @hasMany(() => Village)
  declare villages: HasMany<typeof Village>
  //#endregion
}
