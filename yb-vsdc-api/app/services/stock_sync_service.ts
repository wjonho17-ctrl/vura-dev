import Stock from '#models/stock'
import StockMaster from '#models/stock_master'
import User from '#models/user'
import { EbmService } from '#services/ebm/ebm_service'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'

export interface StockUpdateDto {
  itemCode: string
  itemName: string
  quantity: number
  price: number
  classificationCode: string
  action: 'IN' | 'OUT'
}

export interface StockSyncData {
  itemCode: string
  itemName: string
  quantity: number
  lastSyncDate: string
  syncStatus: 'SYNCED' | 'PENDING' | 'FAILED'
}

export class StockSyncService {
  private user: User
  private ebmService: EbmService

  constructor(user: User) {
    this.user = user
    this.ebmService = new EbmService(user)
  }

  /**
   * Update stock and sync to VSDC
   */
  async updateAndSyncStock(dto: StockUpdateDto): Promise<StockSyncData> {
    try {
      // 1. Get or create stock record
      let stock = await Stock.query()
        .where('user_id', this.user.id)
        .where('item_code', dto.itemCode)
        .first()

      if (!stock) {
        stock = await Stock.create({
          userId: this.user.id,
          itemCode: dto.itemCode,
          itemName: dto.itemName,
          quantity: 0,
          price: dto.price,
          classificationCode: dto.classificationCode,
        })
      }

      // 2. Update quantity based on action
      if (dto.action === 'IN') {
        stock.quantity += dto.quantity
      } else {
        stock.quantity = Math.max(0, stock.quantity - dto.quantity)
      }

      await stock.save()

      // 3. Create stock master record
      const stockMaster = await StockMaster.create({
        userId: this.user.id,
        stockId: stock.id,
        itemCode: dto.itemCode,
        quantityBefore: stock.quantity - dto.quantity,
        quantity: dto.quantity,
        quantityAfter: stock.quantity,
        action: dto.action,
        reference: `STOCK_${dto.action}_${DateTime.now().toMillis()}`,
      })

      // 4. Sync to VSDC
      const syncResult = await this.syncToVSdc(stock, stockMaster)

      return {
        itemCode: dto.itemCode,
        itemName: dto.itemName,
        quantity: stock.quantity,
        lastSyncDate: DateTime.now().toISO(),
        syncStatus: syncResult.success ? 'SYNCED' : 'FAILED',
      }
    } catch (error) {
      logger.error({ err: error, dto }, 'Stock update and sync failed')
      throw error
    }
  }

  /**
   * Sync stock to VSDC
   */
  private async syncToVSdc(
    stock: Stock,
    stockMaster: StockMaster
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Prepare data for VSDC API
      const syncData = {
        tin: this.user.tin,
        branchId: this.user.branchId || '00',
        itemCode: stock.itemCode,
        itemName: stock.itemName,
        quantity: stock.quantity,
        action: stockMaster.action,
        referenceNo: stockMaster.reference,
        timestamp: DateTime.now().toISO(),
      }

      // Send to VSDC Stock API
      const response = await this.ebmService.postEbmData(
        'stockMaster/save',
        JSON.stringify(syncData)
      )

      if (response && response.scsYn === 'Y') {
        // Update sync status
        stockMaster.syncStatus = 'SYNCED'
        stockMaster.lastSyncDate = DateTime.now().toJSDate()
        await stockMaster.save()

        logger.info({ stock: stock.itemCode }, 'Stock synced to VSDC')
        return { success: true }
      } else {
        stockMaster.syncStatus = 'FAILED'
        await stockMaster.save()

        return {
          success: false,
          message: response?.rsltMsg || 'VSDC sync failed',
        }
      }
    } catch (error) {
      logger.warn({ err: error }, 'VSDC stock sync failed')
      return { success: false, message: error.message }
    }
  }

  /**
   * Get all stock with sync status
   */
  async getAllStock(): Promise<StockSyncData[]> {
    const stocks = await Stock.query().where('user_id', this.user.id)

    return Promise.all(
      stocks.map(async (stock) => {
        const master = await StockMaster.query()
          .where('stock_id', stock.id)
          .orderBy('id', 'desc')
          .first()

        return {
          itemCode: stock.itemCode,
          itemName: stock.itemName,
          quantity: stock.quantity,
          lastSyncDate: master?.lastSyncDate ? new Date(master.lastSyncDate).toISOString() : 'Never',
          syncStatus: master?.syncStatus || 'PENDING',
        } as StockSyncData
      })
    )
  }

  /**
   * Sync pending stock items
   */
  async syncPendingStock(): Promise<void> {
    try {
      const pendingMasters = await StockMaster.query()
        .where('user_id', this.user.id)
        .where('sync_status', 'PENDING')
        .preload('stock')
        .limit(100)

      for (const master of pendingMasters) {
        const stock = master.stock
        await this.syncToVSdc(stock, master)
      }

      logger.info('Pending stock sync completed')
    } catch (error) {
      logger.error({ err: error }, 'Pending stock sync failed')
    }
  }

  /**
   * Get stock balance for item
   */
  async getStockBalance(itemCode: string): Promise<number> {
    const stock = await Stock.query()
      .where('user_id', this.user.id)
      .where('item_code', itemCode)
      .first()

    return stock?.quantity || 0
  }

  /**
   * Check if item is in stock
   */
  async isItemAvailable(itemCode: string, quantity: number): Promise<boolean> {
    const balance = await this.getStockBalance(itemCode)
    return balance >= quantity
  }

  /**
   * Get low stock items
   */
  async getLowStockItems(threshold: number = 10): Promise<Stock[]> {
    return Stock.query()
      .where('user_id', this.user.id)
      .where('quantity', '<', threshold)
      .orderBy('quantity', 'asc')
  }

  /**
   * Generate stock report
   */
  async generateStockReport(): Promise<{
    totalItems: number
    totalQuantity: number
    totalValue: number
    lowStockItems: number
    syncedItems: number
    pendingSync: number
  }> {
    const stocks = await Stock.query().where('user_id', this.user.id)
    const masters = await StockMaster.query().where('user_id', this.user.id)

    let totalQuantity = 0
    let totalValue = 0
    let lowStockItems = 0

    stocks.forEach((stock) => {
      totalQuantity += stock.quantity
      totalValue += stock.quantity * stock.price
      if (stock.quantity < 10) {
        lowStockItems++
      }
    })

    const syncedCount = masters.filter((m) => m.syncStatus === 'SYNCED').length
    const pendingCount = masters.filter((m) => m.syncStatus === 'PENDING').length

    return {
      totalItems: stocks.length,
      totalQuantity,
      totalValue,
      lowStockItems,
      syncedItems: syncedCount,
      pendingSync: pendingCount,
    }
  }
}
