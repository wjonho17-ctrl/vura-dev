import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, computed } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { generateRandomInt } from '#app/shared/helpers/math_helper'
import Patient from './patient.js'
import { PrescriptionPharmacyHistory, PrescriptionProduct } from '../../inertia/types/index.js'
import PrescriptionFilter from './filters/prescription_filter.js'
import { Filterable } from 'adonis-lucid-filter'
import { compose } from '@adonisjs/core/helpers'
import HealthFacility from './health_facility.js'

export default class Prescription extends compose(BaseModel, Filterable) {

  static $filter = () => PrescriptionFilter

  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare code: string

  @column()
  declare userId: string

  @column()
  declare insuranceId: string

  @column()
  declare patientId: string

  @column()
  declare healthFacilityId: string

  @column()
  declare pharmacyHistory: { data: PrescriptionPharmacyHistory[] }

  @column()
  declare products: { data: PrescriptionProduct[] }

  @column()
  declare patientName: string

  @column.date()
  declare birthdate: DateTime

  @column()
  declare patientPhone: string

  @column()
  declare patientGenre: 'M' | 'F'

  @column()
  declare patientWeight: number

  @column.date()
  declare treatmentDate: DateTime

  @belongsTo(() => User)
  declare practitioner: BelongsTo<typeof User>

  @belongsTo(() => HealthFacility)
  declare healthFacility: BelongsTo<typeof HealthFacility>

  @belongsTo(() => Patient)
  declare patient: BelongsTo<typeof Patient>

  @beforeCreate()
  static async setCode(prescription: Prescription) {
    prescription.code = DateTime.now().toFormat('ddMMyy') + '-' + generateRandomInt(7).toString()
  }

  updateProducts(products: PrescriptionProduct[]) {
    this.products.data = products
  }

  updateHistory(history: PrescriptionPharmacyHistory) {
    this.pharmacyHistory.data.unshift(history)
    return this
  }

  checkIfProductSold(productId: number, productInPrescription: PrescriptionProduct): boolean {
    const product = this.pharmacyHistory.data.flatMap(history => history.products).filter(p => p.productId === productId)

    const total = product.reduce((sum, p) => sum + p.quantity, 0)

    return productInPrescription.quantity === total
  }

  @computed()
  get productsStatus() {
    const productHistoryStatus: {
      productId: number,
      quantitySold: number,
      quantityLeft: number,
      isSold: boolean
    }[] = []

    for (const product of this.products.data) {
      const history = this.pharmacyHistory.data.flatMap(h => h.products).filter(p => p.productId === product.productId)
      const quantitySold = history.map(h => h.quantity).reduce((a, b) => a + b, 0)
      const quantityLeft = product.quantity - quantitySold
      const isSold = quantitySold == product.quantity && quantityLeft == 0
      productHistoryStatus.push({
        productId: product.productId,
        quantitySold,
        quantityLeft,
        isSold
      })
    }

    return productHistoryStatus
  }

  @computed()
  get isSold() {
    return this.productsStatus.every(p => p.isSold)
  }

}

