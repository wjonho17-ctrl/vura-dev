import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import {
  BaseModel,
  beforeCreate,
  beforeFetch,
  beforeFind,
  belongsTo,
  column,
  computed,
  hasMany,
  hasOne,
  manyToMany,
  scope,
} from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { BelongsTo, HasMany, HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DbRememberMeTokensProvider } from '@adonisjs/auth/session'
import UserOtp from './user_otp.js'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import HealthFacility from './health_facility.js'
import { attachment } from '@jrmc/adonis-attachment'
import type { Attachment } from '@jrmc/adonis-attachment/types/attachment'
import Token from './token.js'
import { TokenType } from '#app/shared/types/token_type'
import Notification from './notification.js'
import { HospitalPosition, MedicalSpecialty, UserRole } from '#app/shared/enums/user_enum'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @attachment({ preComputeUrl: true, disk: 'minio', folder: 'photos' })
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

  @column()
  declare role: UserRole

  @computed()
  public get isStaff() {
    return this.role === UserRole.STAFF
  }

  @computed()
  public get isAdmin() {
    return this.role === UserRole.ADMIN
  }

  @computed()
  public get isManager() {
    return this.role === UserRole.MANAGER
  }

  //#region relationships
  @hasMany(() => UserOtp)
  declare otps: HasMany<typeof UserOtp>

  @belongsTo(() => HealthFacility, {
    foreignKey: 'healthFacilityId'
  })
  declare currentHeathFacility: BelongsTo<typeof HealthFacility>

  @manyToMany(() => HealthFacility, {
    pivotTable: 'user_health_facilities',
    pivotRelatedForeignKey: 'facility_id',
    pivotForeignKey: 'user_id'
  })
  declare healthFacilities: ManyToMany<typeof HealthFacility>

  //#region computes

  @computed()
  public get phoneNumber() {
    return this.phone.replace('+25', '')
  }

  @computed()
  public get initial() {
    return this.firstname[0].toUpperCase() + this.lastname[0].toUpperCase()
  }

  @computed()
  public get fullname() {
    return this.firstname + ' ' + this.lastname
  }

  @beforeCreate()
  static async setId(user: User) {
    user.id = crypto.randomUUID()
  }

  /**
   * Runs before finding a single record from the database
   */
  @beforeFind()
  static findHeathFacility(query: ModelQueryBuilderContract<typeof User>) {
    query.preload('currentHeathFacility')
  }

  @beforeFetch()
  static fetchHeathFacility(query: ModelQueryBuilderContract<typeof User>) {
    query.preload('currentHeathFacility')
  }

  static accessTokens = DbAccessTokensProvider.forModel(User)
  static rememberMeTokens = DbRememberMeTokensProvider.forModel(User)


  @hasMany(() => Token, {
    foreignKey: 'userId',
    localKey: 'id',
  })
  declare tokens: HasMany<typeof Token>

  @hasMany(() => Token, {
    onQuery: (query) => query.where('type', TokenType.RESET_PASSWORD),
  })
  declare passwordResetTokens: HasMany<typeof Token>

  @hasMany(() => Token, {
    onQuery: (query) => query.orWhere('type', TokenType.VERIFY_EMAIL),
  })
  declare verifyEmailTokens: HasMany<typeof Token>

  @manyToMany(() => Notification, {
    pivotTable: 'notification_users',
    pivotForeignKey: 'user_id',
    pivotColumns: ['is_me_read'],
  })
  declare notifications: ManyToMany<typeof Notification>

  static isActive = scope((query) => {
    query.where('is_active', true)
  })
}

