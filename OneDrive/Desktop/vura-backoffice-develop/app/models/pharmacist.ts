import {
  BaseModel,
  beforeCreate,
  column,
  hasOne
} from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import Pharmacy from './pharmacy.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import PharmacyUserProfile from './pharmacy_user_profile.js'
import PharmacistProfile from './pharmacist_profile.js'
import { MedbookUserRole, UserRole } from '#enums/user_role'

export default class Pharmacist extends BaseModel {
  static connection = 'medbook'
  static table = 'users'

  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare email: string

  @column()
  declare phone: string

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column()
  declare roleId: number

  @column()
  declare isActive: boolean

  @column()
  declare isOnline: boolean

  @hasOne(() => Pharmacy, {
    foreignKey: 'ownerId',
  })
  declare pharmacy: HasOne<typeof Pharmacy>

  @hasOne(() => PharmacyUserProfile, {
    foreignKey: 'userId'
  })
  declare profile: HasOne<typeof PharmacyUserProfile>

  @hasOne(() => PharmacistProfile, {
    foreignKey: 'userId'
  })
  declare pharmacistProfile: HasOne<typeof PharmacistProfile>

  declare role: {name: string, id: number}
  declare phoneNumber: string
  
  @beforeCreate()
  static async setId(user: Pharmacist) {
    user.id = crypto.randomUUID()
  }
}
