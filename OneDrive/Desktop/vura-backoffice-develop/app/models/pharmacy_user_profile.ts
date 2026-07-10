import string from '@adonisjs/core/helpers/string'
import { BaseModel, beforeSave, column, computed } from '@adonisjs/lucid/orm'
import { Attachment, attachment } from '@jrmc/adonis-attachment'
import { DateTime } from 'luxon'

export default class PharmacyUserProfile extends BaseModel {
  static connection = 'medbook'
  static table = 'user_profiles'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: string

  @column()
  declare firstname: string

  @column()
  declare gender: 'M' | 'F'

  @column()
  declare lastname: string

  @column()
  declare fullname: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  declare avatar: Attachment | null

  @computed()
  public get initial() {
    return this.firstname[0].toUpperCase() + this.lastname[0].toUpperCase()
  }

  @beforeSave()
  static async setFullname(profile: PharmacyUserProfile) {
    if (profile.$dirty.firstname || profile.$dirty.lastnname) {
      profile.fullname =
        string.capitalCase(profile.firstname) + ' ' + profile.lastname.toUpperCase()
    }
  }
}
