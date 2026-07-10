import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Province from './province.js'
import Sector from './sector.js'

export default class District extends BaseModel {
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
  declare provinceId: number

  @column()
  declare longitude: number

  @column()
  declare latitude: number

  //#region relationships
  @belongsTo(() => Province)
  declare province: BelongsTo<typeof Province>

  @hasMany(() => Sector)
  declare sectors: HasMany<typeof Sector>
  //#endregion
}
