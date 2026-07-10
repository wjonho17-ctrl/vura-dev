import { PharmacyBranchPaymentData } from '#types/pharmacy_branch_type'
import {
  BaseModel,
  beforeCreate,
  belongsTo,
  column,
  computed,
  hasMany
} from '@adonisjs/lucid/orm'
import type {
  BelongsTo,
  HasMany
} from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Pharmacist from './pharmacist.js'
import Pharmacy from './pharmacy.js'
import PharmacyEmployeeProfile from './pharmacy_employee_profile.js'
import Village from './village.js'

export default class PharmacyBranch extends BaseModel {
  static connection = 'medbook'

  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare name: string

  @column()
  declare isMain: boolean

  @column()
  declare pharmacyId: string | null

  @column()
  declare createdById: string | null

  @column()
  declare villageId: number

  @column()
  declare longitude: number

  @column()
  declare latitude: number

  @column({
    serializeAs: null,
  })
  declare score: number

  @column()
  declare postalBox: string | null

  @column()
  declare email: string

  @column()
  declare phoneNumber: string

  @column()
  declare phoneNumberTwo: string | null

  @column()
  declare paymentMehodList: { data: PharmacyBranchPaymentData[] }

  @computed()
  get location() {
    if (!this.longitude || !this.latitude) {
      return null
    }

    return `${this.longitude},${this.latitude}`
  }

  //#region relationships
  @belongsTo(() => Pharmacy, {
    foreignKey: 'pharmacyId',
  })
  declare pharmacy: BelongsTo<typeof Pharmacy>


  @belongsTo(() => Village, {
    foreignKey: 'villageId',
  })
  declare village: BelongsTo<typeof Village>

  //#region relationships
  @belongsTo(() => Pharmacist, {
    foreignKey: 'createdById',
  })
  declare createdBy: BelongsTo<typeof Pharmacist>

  @hasMany(() => PharmacyEmployeeProfile, {
    foreignKey: 'currentBranchId',
  })
  declare employeeProfiles: HasMany<typeof PharmacyEmployeeProfile>

  declare humanReadablePhoneNumber: string

  //#endregion

  //#region hooks
  @beforeCreate()
  static async setId(branch: PharmacyBranch) {
    branch.id = crypto.randomUUID()
  }

}
