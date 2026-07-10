import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, computed } from '@adonisjs/lucid/orm'
import { PharmacyEmployeePosition } from '#types/pharmacy_branch_type'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Pharmacy from './pharmacy.js'
import PharmacyBranch from './pharmacy_branch.js'
import { PharmacyEmployeeRoleProfile } from '#enums/pharmacy_enum'

export default class PharmacyEmployeeProfile extends BaseModel {
  static connection = 'medbook'

  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare userId: string

  @column()
  declare pharmacyId: string | null

  @column()
  declare isCurrent: boolean

  @column()
  declare currentBranchId: string | null

  @column()
  declare position: PharmacyEmployeePosition

  @column()
  declare pharmacyRole: PharmacyEmployeeRoleProfile

  @column()
  declare pushNotificationWebTokens: { data: string[] }

  @column()
  declare pushNotificationAndroidTokens: { data: string[] }

  @computed()
  get isPharmacyManager() {
    return this.position === PharmacyEmployeePosition.PHARMACY_MANAGER
  }

  @computed()
  get isBranchManager() {
    return this.position === PharmacyEmployeePosition.BRANCH_MANAGER
  }

  @computed()
  get isManager() {
    return this.isPharmacyManager || this.isBranchManager
  }

  @computed()
  get isPharmacist() {
    return this.position === PharmacyEmployeePosition.PHARMACIST
  }

  @computed()
  get isNurse() {
    return this.position === PharmacyEmployeePosition.NURSE
  }

  @computed()
  get isFinance() {
    return this.position === PharmacyEmployeePosition.FINANCE
  }

  @computed()
  get isPharmacyEmployee() {
    return this.pharmacyRole == PharmacyEmployeeRoleProfile.PHARMACY
  }

  @computed()
  get isWolsellerPharmacyEmployee() {
    return this.pharmacyRole == PharmacyEmployeeRoleProfile.WHOLESELER_PHARMACY
  }

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Pharmacy)
  declare pharmacy: BelongsTo<typeof Pharmacy>

  @belongsTo(() => PharmacyBranch, {
    foreignKey: 'currentBranchId',
  })
  declare branch: BelongsTo<typeof PharmacyBranch>

}
