import { ProductCategroy, ProductClassification } from '#enums/product_enum'
import { InsuranceProductInfo } from '#types/insurance_type'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, beforeSave, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { Searchable } from '@foadonis/magnify'
import { attachments } from '@jrmc/adonis-attachment'
import { Attachment } from '@jrmc/adonis-attachment/types/attachment'
import { DateTime } from 'luxon'
import InsuranceProduct from './insurance_product.js'

export default class Product extends compose(BaseModel, Searchable) {
  static connection = 'medbook'

  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare name: string

  @attachments({ folder: 'products', disk: 'medbook', preComputeUrl: true, variants: ['thumbnail'] })
  declare images: Attachment[] | null

  @column()
  declare classification: ProductClassification

  @column()
  declare category: ProductCategroy

  @column()
  declare brandName: string

  @column()
  declare composition: string | null

  @column()
  declare isAvailable: boolean

  @column()
  declare isAvailableInPharmacy: boolean

  @column()
  declare strength: string | null

  @column()
  declare dosageForm: string | null

  // FDA Fields
  @column()
  declare fdaRegNo: string | null

  @column()
  declare fdaStrength: string | null

  @column()
  declare fdaForm: string | null

  @column()
  declare fdaPack: string | null

  @column()
  declare fdaShelfLife: string | null

  @column()
  declare fdaManufacturer: string | null

  @column()
  declare fdaCountry: string | null

  @column()
  declare fdaMah: string | null

  @column()
  declare fdaLtr: string | null

  @column.date()
  declare fdaRegDate: DateTime | null

  @column.date()
  declare fdaExpiry: DateTime | null


  @column()
  declare insuranceDrugCode: string

  @column()
  declare barcode: string | null

  // Insurances
  @column()
  declare insuranceInfo: { data: InsuranceProductInfo | null }

  @hasMany(() => InsuranceProduct, {
    foreignKey: 'productId'
  })
  declare insurances: HasMany<typeof InsuranceProduct>

  // EBM
  @column()
  declare ebmClassification: string | null

  @column()
  declare pharmacyId: string | null

  @beforeSave()
  static async setName(product: Product) {
    product.name = `${product.brandName} ${product.strength || ''} ${product.composition ? '(' + product.composition.replaceAll(',', ' + ') + ')' : ''}`
    product.name = product.name.trim()
    product.brandName = product.brandName.toUpperCase()
  }
}
