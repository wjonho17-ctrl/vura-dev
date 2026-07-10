import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, computed, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Prescription from './prescription.js'
import Patient from './patient.js'
import HealthFactilityFilter from './filters/health_factility_filter.js'
import { compose } from '@adonisjs/core/helpers'
import { Filterable } from 'adonis-lucid-filter'

export default class HealthFacility extends compose(BaseModel, Filterable) {
  static $filter = () => HealthFactilityFilter

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

  @manyToMany(() => User, {
    pivotTable: 'user_health_facilities',
    pivotForeignKey: 'facility_id',
    pivotRelatedForeignKey: 'user_id'
  })
  declare users: ManyToMany<typeof User>

  @computed()
  get topAddress() {
    if (!this.address || this.address == '') return ''

    return this.address.split(',').splice(0, 2).join(',')
  }

  @computed()
  get bottomAddress() {
    if (!this.topAddress || this.topAddress == '') return ''
    return this.address.split(',').splice(2, 4).join(',')
  }

  @computed()
  get phoneNumber() {
    return this.phone.replace('+25', '')
  }

  @belongsTo(() => User, {
    foreignKey: 'adminId',
  })
  declare admin: BelongsTo<typeof User>

  @hasMany(() => Prescription)
  declare prescriptions: HasMany<typeof Prescription>

  @hasMany(() => Patient)
  declare patients: HasMany<typeof Patient>

  @beforeCreate()
  static async setId(healthFacility: HealthFacility) {
    healthFacility.id = crypto.randomUUID()
  }
}
