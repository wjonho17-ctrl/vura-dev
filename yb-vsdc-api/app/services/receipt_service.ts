import Receipt from '#models/receipt'
import Sale from '#models/sale'
import User from '#models/user'
import Stock from '#models/stock'
import { EbmTransactionService } from '#services/ebm/ebm_transaction_service'
import { DateTime } from 'luxon'
import QRCode from 'qrcode'
import logger from '@adonisjs/core/services/logger'

export interface CreateReceiptDto {
  customerName: string
  customerTin?: string
  customerMobileNo?: string
  paymentMethod: string
  items: ReceiptItem[]
  receiptType: 'S' | 'R' | 'T' | 'P' | 'C'
  refundReasonCode?: string
  originalInvoiceNo?: number
  remarks?: string
  tradeName?: string
  address?: string
  topMessage?: string
  bottomMessage?: string
}

export interface ReceiptItem {
  code?: string
  classificationCode: string
  name: string
  quantity: number
  price: number
  discountRate?: number
  taxationType: 'A' | 'B' | 'C' | 'D'
  barcode?: string
  expirationDate?: string
}

export interface ReceiptData {
  receiptNo: number
  receiptType: string
  receiptSign: string
  internalData: string
  timestamp: string
  sdcId: string
  mrcNo: string
  qrCode: string
  items: ReceiptItem[]
  totals: ReceiptTotals
}

export interface ReceiptTotals {
  itemCount: number
  taxableAmountA: number
  taxableAmountB: number
  taxableAmountC: number
  taxableAmountD: number
  taxAmountA: number
  taxAmountB: number
  taxAmountC: number
  taxAmountD: number
  totalTaxableAmount: number
  totalTaxAmount: number
  totalAmount: number
}

export class ReceiptService {
  private user: User
  private ebmService: EbmTransactionService
  private receiptCounter: number = 0

  constructor(user: User) {
    this.user = user
    this.ebmService = new EbmTransactionService(user)
  }

  /**
   * Create a complete receipt with VSDC submission
   */
  async createReceipt(dto: CreateReceiptDto): Promise<ReceiptData> {
    try {
      // 1. Validate items and calculate totals
      const totals = this.calculateTotals(dto.items)

      // 2. Get next receipt number
      const receiptNo = await this.getNextReceiptNumber()

      // 3. Prepare receipt data
      const receiptData = {
        tin: this.user.tin,
        branchId: this.user.branchId || '00',
        invoiceNo: receiptNo,
        originalInvoiceNo: dto.originalInvoiceNo || 0,
        customerTin: dto.customerTin,
        customerName: dto.customerName,
        saleType: this.getSaleType(dto.receiptType),
        receiptType: dto.receiptType,
        paymentMethod: dto.paymentMethod,
        saleStatus: '02',
        confirmationDate: DateTime.now().toISO(),
        saleDate: DateTime.now().toISODate(),
        refundDate: dto.receiptType === 'R' ? DateTime.now().toISO() : null,
        refundReason: dto.refundReasonCode,
        totalItems: dto.items.length,
        ...totals,
        registrantId: this.user.tin,
        registrantName: this.user.taxPayerName,
        modifierId: this.user.tin,
        modifierName: this.user.taxPayerName,
        receipt: {
          customerTin: dto.customerTin,
          customerMobileNo: dto.customerMobileNo,
          tradeName: dto.tradeName,
          address: dto.address,
          topMessage: dto.topMessage,
          bottomMessage: dto.bottomMessage,
          itemReceived: 'Y',
        },
        items: this.formatItemsForEbm(dto.items),
      }

      // 4. Submit to VSDC
      const ebmResponse = await this.ebmService.SaveSale({
        ...receiptData,
        receipt: receiptData.receipt,
        items: receiptData.items,
      })

      if (!ebmResponse.scsYn || ebmResponse.scsYn !== 'Y') {
        throw new Error(`VSDC Error: ${ebmResponse.rsltMsg || 'Unknown error'}`)
      }

      // 5. Save receipt to database
      const savedReceipt = await this.saveReceipt(receiptNo, ebmResponse, dto)

      // 6. Update stock
      if (dto.receiptType === 'S') {
        await this.updateStockForSale(dto.items)
      } else if (dto.receiptType === 'R') {
        await this.updateStockForRefund(dto.items)
      }

      // 7. Generate QR code
      const qrCode = await this.generateQRCode(ebmResponse)

      // 8. Create electronic journal entry
      await this.logToElectronicJournal(savedReceipt, ebmResponse)

      return {
        receiptNo,
        receiptType: dto.receiptType,
        receiptSign: ebmResponse.rcptSign,
        internalData: ebmResponse.intrlData,
        timestamp: ebmResponse.vsdcRcptPbctDate,
        sdcId: ebmResponse.sdcId,
        mrcNo: ebmResponse.mrcNo,
        qrCode,
        items: dto.items,
        totals,
      }
    } catch (error) {
      logger.error({ err: error }, 'Receipt creation failed')
      throw error
    }
  }

  /**
   * Calculate receipt totals
   */
  private calculateTotals(items: ReceiptItem[]): ReceiptTotals {
    const totals: ReceiptTotals = {
      itemCount: items.length,
      taxableAmountA: 0,
      taxableAmountB: 0,
      taxableAmountC: 0,
      taxableAmountD: 0,
      taxAmountA: 0,
      taxAmountB: 0,
      taxAmountC: 0,
      taxAmountD: 0,
      totalTaxableAmount: 0,
      totalTaxAmount: 0,
      totalAmount: 0,
    }

    items.forEach((item) => {
      const discountAmount = (item.price * (item.discountRate || 0)) / 100
      const taxableAmount = item.price * item.quantity - discountAmount
      const taxRate = this.getTaxRate(item.taxationType)
      const taxAmount = (taxableAmount * taxRate) / 100

      // Accumulate by tax type
      totals[`taxableAmount${item.taxationType as keyof typeof totals}`] += taxableAmount
      totals[`taxAmount${item.taxationType as keyof typeof totals}`] += Math.round(taxAmount * 100) / 100
      totals.totalTaxableAmount += taxableAmount
      totals.totalTaxAmount += Math.round(taxAmount * 100) / 100
      totals.totalAmount += taxableAmount + Math.round(taxAmount * 100) / 100
    })

    return totals
  }

  /**
   * Format items for EBM API
   */
  private formatItemsForEbm(items: ReceiptItem[]) {
    return items.map((item, index) => ({
      itemSeq: index + 1,
      itemCd: item.code || `ITEM${index + 1}`,
      itemClsCd: item.classificationCode,
      itemNm: item.name,
      bcd: item.barcode,
      pkgUnitCd: 'BQ',
      pkg: 1,
      qtyUnitCd: 'TU',
      qty: item.quantity,
      prc: item.price,
      splyAmt: item.price * item.quantity,
      dcRt: item.discountRate || 0,
      dcAmt: (item.price * (item.discountRate || 0)) / 100,
      taxTyCd: item.taxationType,
      taxblAmt: item.price * item.quantity - (item.price * (item.discountRate || 0)) / 100,
      taxAmt: this.calculateTax(
        item.price * item.quantity - (item.price * (item.discountRate || 0)) / 100,
        item.taxationType
      ),
      totAmt:
        item.price * item.quantity -
        (item.price * (item.discountRate || 0)) / 100 +
        this.calculateTax(
          item.price * item.quantity - (item.price * (item.discountRate || 0)) / 100,
          item.taxationType
        ),
      itemExprDt: item.expirationDate?.replaceAll('-', ''),
    }))
  }

  /**
   * Get next receipt number
   */
  private async getNextReceiptNumber(): Promise<number> {
    const lastReceipt = await Receipt.query()
      .where('user_id', this.user.id)
      .orderBy('id', 'desc')
      .first()

    return (lastReceipt?.invoiceNo || 0) + 1
  }

  /**
   * Save receipt to database
   */
  private async saveReceipt(
    receiptNo: number,
    ebmResponse: any,
    dto: CreateReceiptDto
  ): Promise<Receipt> {
    const sale = await Sale.create({
      userId: this.user.id,
      tin: this.user.tin,
      branchId: this.user.branchId,
      invoiceNo: receiptNo,
      originalInvoiceNo: dto.originalInvoiceNo,
      customerTin: dto.customerTin,
      customerName: dto.customerName,
      saleType: this.getSaleType(dto.receiptType),
      receiptType: dto.receiptType,
      paymentMethod: dto.paymentMethod,
      saleStatus: '02',
      confirmationDate: DateTime.now().toJSDate(),
      saleDate: DateTime.now().toJSDate(),
      totalItems: dto.items.length,
      totalAmount: 0, // Will be calculated
      remarks: dto.remarks,
    })

    const receipt = await Receipt.create({
      userId: this.user.id,
      saleId: sale.id,
    })

    return receipt
  }

  /**
   * Update stock for sale
   */
  private async updateStockForSale(items: ReceiptItem[]): Promise<void> {
    for (const item of items) {
      const stock = await Stock.query()
        .where('user_id', this.user.id)
        .where('item_code', item.code)
        .first()

      if (stock) {
        stock.quantity = Math.max(0, stock.quantity - item.quantity)
        await stock.save()
      }
    }
  }

  /**
   * Update stock for refund
   */
  private async updateStockForRefund(items: ReceiptItem[]): Promise<void> {
    for (const item of items) {
      const stock = await Stock.query()
        .where('user_id', this.user.id)
        .where('item_code', item.code)
        .first()

      if (stock) {
        stock.quantity += item.quantity
        await stock.save()
      }
    }
  }

  /**
   * Generate QR code for receipt
   */
  private async generateQRCode(ebmResponse: any): Promise<string> {
    try {
      const qrData = `${ebmResponse.rcptNo}|${ebmResponse.rcptSign}|${ebmResponse.vsdcRcptPbctDate}`
      const qrCode = await QRCode.toDataURL(qrData)
      return qrCode
    } catch (error) {
      logger.warn({ err: error }, 'QR code generation failed')
      return ''
    }
  }

  /**
   * Log to electronic journal (EJ)
   */
  private async logToElectronicJournal(receipt: Receipt, ebmResponse: any): Promise<void> {
    try {
      const ejEntry = {
        receiptId: receipt.id,
        receiptNo: ebmResponse.rcptNo,
        receiptSign: ebmResponse.rcptSign,
        internalData: ebmResponse.intrlData,
        timestamp: ebmResponse.vsdcRcptPbctDate,
        sdcId: ebmResponse.sdcId,
        mrcNo: ebmResponse.mrcNo,
        status: 'SUCCESS',
      }

      logger.info(ejEntry, 'Electronic Journal Entry')
    } catch (error) {
      logger.warn({ err: error }, 'Electronic journal logging failed')
    }
  }

  /**
   * Helper functions
   */
  private getSaleType(receiptType: string): string {
    switch (receiptType) {
      case 'R':
        return 'N' // Refund is still Normal type
      case 'T':
        return 'T' // Training
      case 'P':
        return 'P' // Proforma
      case 'C':
        return 'C' // Copy
      default:
        return 'N' // Normal Sale
    }
  }

  private getTaxRate(taxationType: string): number {
    const taxRates: { [key: string]: number } = {
      A: 0,
      B: 18,
      C: 0,
      D: 0,
    }
    return taxRates[taxationType] || 0
  }

  private calculateTax(amount: number, taxationType: string): number {
    const rate = this.getTaxRate(taxationType)
    return Math.round((amount * rate) / 100 * 100) / 100
  }
}
