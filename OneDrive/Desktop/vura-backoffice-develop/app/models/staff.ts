import { HospitalPosition, MedicalSpecialty, UserPrescriptionRole } from '#enums/prescription_user_enum'
import {
  BaseModel,
  beforeCreate,
  beforeFetch,
  beforeFind,
  belongsTo,
  column,
  computed
} from '@adonisjs/lucid/orm'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { attachment } from '@jrmc/adonis-attachment'
import type { Attachment } from '@jrmc/adonis-attachment/types/attachment'
import { DateTime } from 'luxon'
import HealthFacility from './health_facility.js'

export default class Staff extends BaseModel {
  static connection = 'e_prescription'
  static table = 'users'

  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @attachment({ disk: 'e_prescription', folder: 'photos', variants: ['thumbnail'], preComputeUrl: true })
  declare photo: Attachment | null

  @column()
  declare email: string

  @column()
  declare firstname: string

  @column()
  declare lastname: string

  @column()
  declare phone: string

  @column()
  declare regno: string


  @column()
  declare role: UserPrescriptionRole

  @computed()
  public get isStaff() {
    return this.role === UserPrescriptionRole.STAFF
  }

  @computed()
  public get isAdmin() {
    return this.role === UserPrescriptionRole.ADMIN
  }

  @computed()
  public get isManager() {
    return this.role === UserPrescriptionRole.MANAGER
  }

  @column()
  declare position: HospitalPosition

  @column()
  declare specialities: { data: MedicalSpecialty[] }

  @column()
  declare healthFacilityId: string

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column()
  declare isActive: boolean

  @column()
  declare isOnline: boolean

  @column()
  declare genre: 'M' | 'F'

  @belongsTo(() => HealthFacility)
  declare currentHeathFacility: BelongsTo<typeof HealthFacility>

  @belongsTo(() => HealthFacility)
  declare heathFacilities: BelongsTo<typeof HealthFacility>

  //#region computes

  @computed()
  public get phoneNumber() {
    return this.phone.replace('+25', '')
  }

  @computed()
  public get fullname() {
    return `${this.firstname} ${this.lastname}`
  }

  @computed()
  public get initial() {
    return this.firstname.charAt(0) + this.lastname.charAt(0)
  }

  @beforeCreate()
  static async setId(user: Staff) {
    user.id = crypto.randomUUID()
  }

  /**
   * Runs before finding a single record from the database
   */
  @beforeFind()
  static findHeathFacility(query: ModelQueryBuilderContract<typeof Staff>) {
    query.preload('currentHeathFacility')
  }

  @beforeFetch()
  static fetchHeathFacility(query: ModelQueryBuilderContract<typeof Staff>) {
    query.preload('currentHeathFacility')
  }
}
