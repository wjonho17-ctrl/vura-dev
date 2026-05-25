import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, beforeSave, belongsTo, column, scope } from '@adonisjs/lucid/orm'
import {
  EbmPaymentMethod,
  EbmReceiptType,
  EbmTransactionProgress,
  EbmTransactionType,
} from '#types/ebm/ebm_type'
import type {
  EbmItem,
  EbmReceipt,
  SaleEbmResponseData,
} from '#types/ebm/ebm_service_type'
import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { Filterable } from 'adonis-lucid-filter'
import { compose } from '@adonisjs/core/helpers'
import SaleFilter from '#filters/sale_filter'
import env from '#start/env'
import Purchase from './purchase.js'

export default class Sale extends compose(BaseModel, Filterable) {
  static $filter = () => SaleFilter

  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare tin: number

  @column()
  declare branchId: string

  @column()
  declare invoiceNo: number

  @column()
  declare originalInvoiceNo: number

  @column()
  declare customerTin: number | null

  @column()
  declare purchaseCode: string | null

  @column()
  declare customerName: string

  @column()
  declare saleType: EbmTransactionType

  @column()
  declare receiptType: EbmReceiptType

  @column()
  declare paymentMethod: EbmPaymentMethod

  @column()
  declare saleStatus: EbmTransactionProgress

  @column.dateTime()
  declare confirmationDate: DateTime

  @column.date()
  declare saleDate: DateTime

  @column.dateTime()
  declare stockReleaseDate: DateTime | null

  @column.dateTime()
  declare cancelRequestDate: DateTime | null

  @column.dateTime()
  declare canceledDate: DateTime | null

  @column.dateTime()
  declare refundDate: DateTime | null

  @column()
  declare refundReason: EbmTransactionProgress | null

  @column()
  declare totalItems: number

  @column()
  declare taxableAmountA: number

  @column()
  declare taxableAmountB: number

  @column()
  declare taxableAmountC: number

  @column()
  declare taxableAmountD: number

  @column()
  declare taxRateA: number

  @column()
  declare taxRateB: number

  @column()
  declare taxRateC: number

  @column()
  declare taxRateD: number

  @column()
  declare taxAmountA: number

  @column()
  declare taxAmountB: number

  @column()
  declare taxAmountC: number

  @column()
  declare taxAmountD: number

  @column()
  declare totalTaxableAmount: number

  @column()
  declare totalTaxAmount: number

  @column()
  declare totalAmount: number

  @column()
  declare itemsReceived: string

  @column()
  declare remark: string | null

  @column()
  declare registrantName: string

  @column()
  declare registrantId: string

  @column()
  declare modifierId: string

  @column()
  declare modifierName: string

  @column()
  declare receipt: EbmReceipt // Store receipt data as JSON

  @column()
  declare items: { data: EbmItem[] } // Store items data as JSON

  @column()
  declare ebmSaleData: SaleEbmResponseData

  // Signature chain — hash of the previous receipt at the time this sale was issued
  @column()
  declare previousRcptSign: string | null

  @column()
  declare previousIntrlData: string | null

  @column()
  declare cisApiVersion: string

  @column()
  declare ebmApiVersion: string

  @column()
  declare resultDt: string

  @column()
  declare invoiceType: string

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
  //#endregion

  //#region relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Purchase)
  declare purchase: BelongsTo<typeof Purchase>
  //#endregion

  //#region hooks
  @beforeCreate()
  static async setId(sale: Sale) {
    sale.id = crypto.randomUUID()
  }

  @beforeSave()
  static async insertApiVersion(sale: Sale) {
    sale.ebmApiVersion = env.get('EBM_API_VERSION')
  }

  @beforeSave()
  static async insertInvoiceType(sale: Sale) {
    sale.invoiceType = sale.saleType + sale.receiptType
  }

  //#endregion

  //#region scopes
  
    static totaltSummuries = scope((query) => {
      query
        .count('*', 'totalReceipt')
        .sum('total_amount', 'totalAmount')
    })
  
  static taxAmountSummuries = scope((query) => {
    query
      .sum('taxable_amount_a', 'taxableAmountA')
      .sum('taxable_amount_b', 'taxableAmountB')
      .sum('taxable_amount_c', 'taxableAmountC')
      // .sum('taxable_amount_d', 'taxableAmountD')
      // .sum('tax_amount_a', 'taxAmountA')
      .sum('tax_amount_b', 'taxAmountB')
      .sum('tax_amount_c', 'taxAmountC')
      .sum('tax_amount_d', 'taxAmountD')
      .sum('total_items', 'totalItems')
  })

  //#endregion
}
