import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeFetch,
  beforeFind,
  belongsTo,
  column,
  computed,
} from '@adonisjs/lucid/orm'
import { attachment } from '@jrmc/adonis-attachment'
import PharmacyBranch from './pharmacy_branch.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { Attachment } from '@jrmc/adonis-attachment/types/attachment'

export default class PharmacistProfile extends BaseModel {
  static connection = 'medbook'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: string

  @attachment({ folder: 'pharmacy/pharmacist_license', disk: 'medbook' })
  declare pharmacyLicense: Attachment

  @attachment({ folder: 'pharmacy/fda_license', disk: 'medbook' })
  declare fdaLicense: Attachment

  @column()
  declare currentBranchId?: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare pushNotificationWebTokens: { data: string[] }

  @column()
  declare pushNotificationAndroidTokens: { data: string[] }

  //#region relationships

  @belongsTo(() => PharmacyBranch, {
    foreignKey: 'currentBranchId',
  })
  declare currentBranch: BelongsTo<typeof PharmacyBranch>
  //#endregion

  //#region hooks

  /**
   * Runs before finding multiple records from the database
   */
  @beforeFetch()
  static fetchBranch(query: ModelQueryBuilderContract<typeof PharmacistProfile>) {
    query.preload('currentBranch')
  }

  /**
   * Runs before finding a single record from the database
   */
  @beforeFind()
  static findRBranch(query: ModelQueryBuilderContract<typeof PharmacistProfile>) {
    query.preload('currentBranch')
  }

  //#endregion
}
