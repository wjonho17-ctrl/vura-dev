import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import District from './district.js'

export default class Province extends BaseModel {
  static connection = 'medbook'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare longitude: number

  @column()
  declare latitude: number

  //#region relationships
  @hasMany(() => District)
  declare districts: HasMany<typeof District>
  //#endregion
}
