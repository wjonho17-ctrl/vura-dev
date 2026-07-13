import { HttpContext } from '@adonisjs/core/http'
import { StockSyncService, StockUpdateDto } from '#services/stock_sync_service'
import User from '#models/user'
import vine from '@vinejs/vine'
import logger from '@adonisjs/core/services/logger'

export default class StockController {
  /**
   * Update stock
   * POST /api/stock/update
   */
  async update({ request, auth, response }: HttpContext) {
    const validator = vine.compile(
      vine.object({
        itemCode: vine.string().minLength(1),
        itemName: vine.string().minLength(1),
        quantity: vine.number().min(0.01),
        price: vine.number().min(0),
        classificationCode: vine.string().minLength(1),
        action: vine.enum(['IN', 'OUT']),
      })
    )

    try {
      const user = auth.user as User
      const payload = await request.validateUsing(validator)

      const stockService = new StockSyncService(user)
      const result = await stockService.updateAndSyncStock(payload as StockUpdateDto)

      return response.ok({
        success: true,
        data: result,
        message: 'Stock updated and synced',
      })
    } catch (error) {
      logger.error({ err: error }, 'Stock update error')
      return response.badRequest({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * Get all stock items
   * GET /api/stock
   */
  async list({ auth, response, request }: HttpContext) {
    try {
      const user = auth.user as User
      const page = request.input('page', 1)
      const limit = request.input('limit', 50)
      const search = request.input('search', '')

      const query = user.related('stocks').query()

      if (search) {
        query
          .whereRaw('LOWER(item_code) LIKE ?', [`%${search.toLowerCase()}%`])
          .orWhereRaw('LOWER(item_name) LIKE ?', [`%${search.toLowerCase()}%`])
      }

      const stocks = await query.paginate(page, limit)

      return response.ok({
        success: true,
        data: stocks,
      })
    } catch (error) {
      logger.error({ err: error }, 'Stock list error')
      return response.internalServerError({
        success: false,
        message: 'Failed to fetch stock',
      })
    }
  }

  /**
   * Get stock balance for item
   * GET /api/stock/:itemCode/balance
   */
  async balance({ params, auth, response }: HttpContext) {
    try {
      const user = auth.user as User
      const stockService = new StockSyncService(user)
      const balance = await stockService.getStockBalance(params.itemCode)

      return response.ok({
        success: true,
        data: {
          itemCode: params.itemCode,
          balance,
          available: balance > 0,
        },
      })
    } catch (error) {
      logger.error({ err: error }, 'Stock balance error')
      return response.internalServerError({
        success: false,
        message: 'Failed to fetch balance',
      })
    }
  }

  /**
   * Check if item is available
   * GET /api/stock/:itemCode/check
   */
  async check({ params, auth, response, request }: HttpContext) {
    try {
      const user = auth.user as User
      const quantity = request.input('quantity', 1)

      const stockService = new StockSyncService(user)
      const available = await stockService.isItemAvailable(params.itemCode, quantity)

      return response.ok({
        success: true,
        data: {
          itemCode: params.itemCode,
          requestedQuantity: quantity,
          available,
        },
      })
    } catch (error) {
      logger.error({ err: error }, 'Stock check error')
      return response.internalServerError({
        success: false,
        message: 'Failed to check availability',
      })
    }
  }

  /**
   * Get low stock items
   * GET /api/stock/alerts/low
   */
  async lowStock({ auth, response, request }: HttpContext) {
    try {
      const user = auth.user as User
      const threshold = request.input('threshold', 10)

      const stockService = new StockSyncService(user)
      const items = await stockService.getLowStockItems(threshold)

      return response.ok({
        success: true,
        data: {
          threshold,
          items: items.map((item) => ({
            itemCode: item.itemCode,
            itemName: item.itemName,
            quantity: item.quantity,
            price: item.price,
            value: item.quantity * item.price,
          })),
          count: items.length,
        },
      })
    } catch (error) {
      logger.error({ err: error }, 'Low stock error')
      return response.internalServerError({
        success: false,
        message: 'Failed to fetch low stock items',
      })
    }
  }

  /**
   * Get stock report
   * GET /api/stock/report
   */
  async report({ auth, response }: HttpContext) {
    try {
      const user = auth.user as User
      const stockService = new StockSyncService(user)
      const report = await stockService.generateStockReport()

      return response.ok({
        success: true,
        data: report,
      })
    } catch (error) {
      logger.error({ err: error }, 'Stock report error')
      return response.internalServerError({
        success: false,
        message: 'Failed to generate report',
      })
    }
  }

  /**
   * Sync pending stock
   * POST /api/stock/sync-pending
   */
  async syncPending({ auth, response }: HttpContext) {
    try {
      const user = auth.user as User
      const stockService = new StockSyncService(user)
      await stockService.syncPendingStock()

      return response.ok({
        success: true,
        message: 'Pending stock sync initiated',
      })
    } catch (error) {
      logger.error({ err: error }, 'Pending sync error')
      return response.badRequest({
        success: false,
        message: error.message,
      })
    }
  }

  /**
   * Get all stock with sync status
   * GET /api/stock/sync-status
   */
  async syncStatus({ auth, response }: HttpContext) {
    try {
      const user = auth.user as User
      const stockService = new StockSyncService(user)
      const stocks = await stockService.getAllStock()

      return response.ok({
        success: true,
        data: stocks,
      })
    } catch (error) {
      logger.error({ err: error }, 'Sync status error')
      return response.internalServerError({
        success: false,
        message: 'Failed to fetch sync status',
      })
    }
  }
}
