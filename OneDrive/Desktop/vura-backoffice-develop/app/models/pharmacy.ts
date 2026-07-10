import { BaseModel, beforeCreate, belongsTo, column, computed, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { attachment } from '@jrmc/adonis-attachment'
import type { Attachment } from '@jrmc/adonis-attachment/types/attachment'
import { DateTime } from 'luxon'
import PharmacyBranch from './pharmacy_branch.js'
import PharmacyEmployeeProfile from './pharmacy_employee_profile.js'
import Pharmacist from './pharmacist.js'

export default class Pharmacy extends BaseModel {
  static connection = 'medbook'

  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @attachment({ folder: 'pharmacy/logos', disk: 'medbook', preComputeUrl: true })
  declare logo: Attachment | null

  @column()
  declare name: string

  @column()
  declare ownerId: string

  @column({
    serializeAs: null,
  })
  declare score: number

  @column()
  declare tin: number

  @column()
  declare postalBox: string | null

  @column()
  declare email: string

  @column()
  declare phoneNumber: string

  @column()
  declare phoneNumberTwo: string | null

  @column()
  declare isWholeseller: boolean
  
  @column()
  declare isImporter: boolean

  //#region hooks
  @belongsTo(() => Pharmacist, {
    foreignKey: 'ownerId',
  })
  declare owner: BelongsTo<typeof Pharmacist>

  @hasMany(() => PharmacyBranch)
  declare branches: HasMany<typeof PharmacyBranch>

  @hasMany(() => PharmacyEmployeeProfile, {
    foreignKey: 'pharmacyId',
  })
  declare employeeProfiles: HasMany<typeof PharmacyEmployeeProfile>

  declare humanReadablePhoneNumber: string
  //#endregion

  @computed()
  get initial() {
    return this.name.slice(0, 1).toUpperCase()
  }

  //#region hooks
  @beforeCreate()
  static async setId(pharmacy: Pharmacy) {
    pharmacy.id = crypto.randomUUID()
  }

  //#endregion
}
