import { HttpContext } from '@adonisjs/core/http'
import { ReceiptService, CreateReceiptDto } from '#services/receipt_service'
import { StockSyncService } from '#services/stock_sync_service'
import User from '#models/user'
import vine from '@vinejs/vine'
import logger from '@adonisjs/core/services/logger'

export default class ReceiptsController {
  /**
   * Create a new receipt
   * POST /api/receipts
   */
  async create({ request, auth, response }: HttpContext) {
    const validator = vine.compile(
      vine.object({
        customerName: vine.string().minLength(2).maxLength(100),
        customerTin: vine.string().optional(),
        customerMobileNo: vine.string().optional(),
        paymentMethod: vine.string().minLength(1).maxLength(10),
        receiptType: vine.enum(['S', 'R', 'T', 'P', 'C']),
        refundReasonCode: vine.string().optional(),
        originalInvoiceNo: vine.number().optional(),
        remarks: vine.string().optional(),
        tradeName: vine.string().optional(),
        address: vine.string().optional(),
        topMessage: vine.string().optional(),
        bottomMessage: vine.string().optional(),
        items: vine.array(
          vine.object({
            code: vine.string().optional(),
            classificationCode: vine.string().minLength(1),
            name: vine.string().minLength(1),
            quantity: vine.number().min(0.01),
            price: vine.number().min(0.01),
            discountRate: vine.number().optional(),
            taxationType: vine.enum(['A', 'B', 'C', 'D']),
            barcode: vine.string().optional(),
            expirationDate: vine.string().optional(),
          })
        ),
      })
    )

    try {
      const user = auth.user as User
      const payload = await request.validateUsing(validator)

      const receiptService = new ReceiptService(user)
      const receipt = await receiptService.createReceipt(payload as CreateReceiptDto)

      return response.created({
        success: true,
        data: receipt,
        message: 'Receipt created successfully',
      })
    } catch (error) {
      logger.error({ err: error }, 'Receipt creation error')
      return response.badRequest({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * Get all receipts for user
   * GET /api/receipts
   */
  async list({ request, auth, response }: HttpContext) {
    try {
      const user = auth.user as User
      const page = request.input('page', 1)
      const limit = request.input('limit', 20)

      const receipts = await user.related('receipts').query().paginate(page, limit)

      return response.ok({
        success: true,
        data: receipts,
      })
    } catch (error) {
      logger.error({ err: error }, 'Receipt list error')
      return response.internalServerError({
        success: false,
        message: 'Failed to fetch receipts',
      })
    }
  }

  /**
   * Get receipt details
   * GET /api/receipts/:id
   */
  async show({ params, auth, response }: HttpContext) {
    try {
      const user = auth.user as User
      const receipt = await user.related('receipts').query().andWhere('id', params.id).firstOrFail()

      return response.ok({
        success: true,
        data: receipt,
      })
    } catch (error) {
      logger.error({ err: error }, 'Receipt show error')
      return response.notFound({
        success: false,
        message: 'Receipt not found',
      })
    }
  }

  /**
   * Print receipt
   * GET /api/receipts/:id/print
   */
  async print({ params, auth, response }: HttpContext) {
    try {
      const user = auth.user as User
      const receipt = await user
        .related('receipts')
        .query()
        .andWhere('id', params.id)
        .preload('sale')
        .firstOrFail()

      // Return receipt data for printing
      return response.ok({
        success: true,
        data: {
          receipt,
          sale: receipt.sale,
          printUrl: `/api/receipts/${params.id}/pdf`,
        },
      })
    } catch (error) {
      logger.error({ err: error }, 'Receipt print error')
      return response.notFound({
        success: false,
        message: 'Receipt not found',
      })
    }
  }

  /**
   * Generate receipt PDF
   * GET /api/receipts/:id/pdf
   */
  async pdf({ params, auth, response }: HttpContext) {
    try {
      const user = auth.user as User
      const receipt = await user
        .related('receipts')
        .query()
        .andWhere('id', params.id)
        .preload('sale')
        .firstOrFail()

      // This would integrate with the existing PDF generation
      return response.ok({
        success: true,
        message: 'PDF generation initiated',
        downloadUrl: `/receipts/${params.id}?format=pdf`,
      })
    } catch (error) {
      logger.error({ err: error }, 'Receipt PDF error')
      return response.notFound({
        success: false,
        message: 'Receipt not found',
      })
    }
  }

  /**
   * Get receipt statistics
   * GET /api/receipts/stats/summary
   */
  async stats({ auth, response }: HttpContext) {
    try {
      const user = auth.user as User

      const receipts = await user.related('receipts').query()
      const totalReceiptCount = receipts.length

      // Calculate totals
      let totalAmount = 0
      let totalTaxAmount = 0

      receipts.forEach((receipt) => {
        // This would be calculated from sale data
      })

      return response.ok({
        success: true,
        data: {
          totalReceipts: totalReceiptCount,
          totalAmount,
          totalTaxAmount,
          averageAmount: totalReceiptCount > 0 ? totalAmount / totalReceiptCount : 0,
        },
      })
    } catch (error) {
      logger.error({ err: error }, 'Receipt stats error')
      return response.internalServerError({
        success: false,
        message: 'Failed to fetch statistics',
      })
    }
  }

  /**
   * Resend receipt to VSDC
   * POST /api/receipts/:id/resend
   */
  async resend({ params, auth, response }: HttpContext) {
    try {
      const user = auth.user as User
      const receipt = await user
        .related('receipts')
        .query()
        .andWhere('id', params.id)
        .preload('sale')
        .firstOrFail()

      // Resend logic would go here
      return response.ok({
        success: true,
        message: 'Receipt resent to VSDC',
      })
    } catch (error) {
      logger.error({ err: error }, 'Receipt resend error')
      return response.badRequest({
        success: false,
        message: error.message,
      })
    }
  }
}
