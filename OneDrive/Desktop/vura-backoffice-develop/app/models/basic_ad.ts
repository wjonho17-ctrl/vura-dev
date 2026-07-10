import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { Attachment, attachment } from '@jrmc/adonis-attachment'
import { BasicAdTarget } from '#types/api/medbook/basic_ads_type'
import { compose } from '@adonisjs/core/helpers'
import { serializePhoneNumber as serialize } from '#helpers/index'

export default class BasicAd extends BaseModel {
  static connection = 'medbook'

  // static $filter = () => PharmacyBranchFilter

  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare views: number

  @column()
  declare target: BasicAdTarget

  @column()
  declare shares: number

  @column()
  declare visits: number

  @column()
  declare adminName: string

  @column()
  declare adminEmail: string

  @column({ serialize })
  declare adminPhone: string

  @column()
  declare organizationName: string

  @column()
  declare organizationEmail: string

  @column({ serialize })
  declare organizationPhone: string

  @column()
  declare customerName: string

  @column()
  declare customerEmail: string | null

  @column({ serialize })
  declare customerPhone: string

  @column()
  declare description: string | null

  @column()
  declare link: string | null

  @column.dateTime()
  declare startAt: DateTime

  @column.dateTime()
  declare endAt: DateTime


  @attachment({ folder: 'basic_ads', disk: 'medbook', preComputeUrl: true, variants: ['basic_ad'] })
  declare image: Attachment

}