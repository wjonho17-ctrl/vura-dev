import { compose } from '@adonisjs/core/helpers'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { Searchable } from '@foadonis/magnify'
import { DateTime } from 'luxon'
import Product from './product.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { InsuranceType } from '#types/insurance_type'

export default class InsuranceProduct extends compose(BaseModel, Searchable) {

  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare price: number

  @column()
  declare productId: number | null

  @column()
  declare type: InsuranceType

  @belongsTo(() => InsuranceProduct, {
    foreignKey: 'productId'
  })
  declare product: BelongsTo<typeof InsuranceProduct>

}