import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbRememberMeTokensProvider } from '@adonisjs/auth/session'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import {
  BaseModel,
  beforeCreate,
  column,
  computed,
  hasMany
} from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import AdminOtp from './admin_otp.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class Admin extends compose(BaseModel, AuthFinder) {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare email: string

  @column()
  declare firstname: string

  @column()
  declare lastname: string

  @column()
  declare phone: string

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

  //#region relationships
  @hasMany(() => AdminOtp)
  declare otps: HasMany<typeof AdminOtp>

  //#region computes

  @computed()
  public get phoneNumber() {
    return this.phone.replace('+25', '')
  }

  @computed()
  public get fullname() {
    return this.firstname + ' ' + this.lastname
  }

  @beforeCreate()
  static async setId(user: Admin) {
    user.id = crypto.randomUUID()
  }



  static accessTokens = DbAccessTokensProvider.forModel(Admin)
  static rememberMeTokens = DbRememberMeTokensProvider.forModel(Admin)
}
