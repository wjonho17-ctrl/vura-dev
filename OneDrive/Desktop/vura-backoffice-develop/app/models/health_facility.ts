import { BaseModel, beforeCreate, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Staff from './staff.js'

export default class HealthFacility extends BaseModel {
  static connection = 'e_prescription'

  @column({ isPrimary: true })
  declare id: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare name: string

  @column()
  declare address: string

  @column()
  declare adminId: string

  @column()
  declare villageId: number

  @column()
  declare postalBox: string | null

  @column()
  declare phoneTwo: string | null

  @column()
  declare email: string

  @column()
  declare phone: string

  @column()
  declare longitude: number

  @column()
  declare latitude: number

  @hasMany(() => Staff)
  declare doctors: HasMany<typeof Staff>

  @belongsTo(() => Staff, {
    foreignKey: 'adminId'
  })
  declare admin: BelongsTo<typeof Staff>

  @manyToMany(() => Staff, {
    pivotTable: 'user_health_facilities',
    pivotForeignKey: 'facility_id',
    pivotRelatedForeignKey: 'user_id'
  })
  declare staffs: ManyToMany<typeof Staff>

  declare users: Staff[]
  declare phoneNumber: string

  @beforeCreate()
  static async setId(healthFacility: HealthFacility) {
    healthFacility.id = crypto.randomUUID()
  }
}
