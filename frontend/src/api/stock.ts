import { apiClient } from './client'

export interface StockUpdatePayload {
  itemCode: string
  itemName: string
  quantity: number
  price: number
  classificationCode: string
  action: 'IN' | 'OUT'
}

export const stockApi = {
  /**
   * Update stock
   */
  async updateStock(payload: StockUpdatePayload) {
    return apiClient.post('/stock/update', payload)
  },

  /**
   * Get all stock items
   */
  async getStock(page = 1, limit = 50, search = '') {
    return apiClient.get(`/stock?page=${page}&limit=${limit}&search=${search}`)
  },

  /**
   * Get stock balance for an item
   */
  async getBalance(itemCode: string) {
    return apiClient.get(`/stock/${itemCode}/balance`)
  },

  /**
   * Check if item is available
   */
  async checkAvailability(itemCode: string, quantity: number) {
    return apiClient.get(`/stock/${itemCode}/check?quantity=${quantity}`)
  },

  /**
   * Get low stock items
   */
  async getLowStock(threshold = 10) {
    return apiClient.get(`/stock/alerts/low?threshold=${threshold}`)
  },

  /**
   * Get stock report
   */
  async getStockReport() {
    return apiClient.get('/stock/report')
  },

  /**
   * Get stock sync status
   */
  async getSyncStatus() {
    return apiClient.get('/stock/sync-status')
  },

  /**
   * Sync pending stock items
   */
  async syncPending() {
    return apiClient.post('/stock/sync-pending')
  },
}
