import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { captureSentryContactSupportError } from '#helpers/sentry_helper'

export default class PmsAppSetting extends BaseModel {
  static connection = 'medbook'
  static table = 'app_settings'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare version: number

  // Products ADS
  @column()
  declare pharmacyAdsPrice: number

  @column()
  declare importerAdsPrice: number

  // TRANSPORTER
  @column()
  declare transporterComissionRate: number

  @column()
  declare transporterComissionMaxAmount: number

  @column()
  declare transporterWalletCollectHourStart: number

  @column()
  declare transporterWalletCollectHourEnd: number

  //PUSH NOTIFICATION
  @column()
  declare pushNotificationLogoUrl: string

  @column()
  declare pushNotificationOrderDeliveryImageUrl: string

  @column()
  declare pushNotificationOrderImageUrl: string

  @column()
  declare pushNotificationShoppingImageUrl: string

  // DELIVERY
  @column()
  declare deliveryMaxPrice: number

  @column()
  declare deliveryPriceKmInterval: number

  @column()
  declare deliveryPricePerKm: number

  static getActiveSetting() {
    const setting = this.query().where('is_active', true).first()

    if (!setting) {
      const error = new Error('App setting not found')
      captureSentryContactSupportError(error, { email: 'sys.office@vura.rw', username: 'sys.office.vura' }, 'contact_support')
    }

    return setting
  }

}