import { apiClient } from './client'

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

export interface CreateReceiptPayload {
  customerName: string
  customerTin?: string
  customerMobileNo?: string
  paymentMethod: string
  receiptType: 'S' | 'R' | 'T' | 'P' | 'C'
  refundReasonCode?: string
  originalInvoiceNo?: number
  remarks?: string
  tradeName?: string
  address?: string
  topMessage?: string
  bottomMessage?: string
  items: ReceiptItem[]
}

export const receiptApi = {
  /**
   * Create a new receipt
   */
  async createReceipt(payload: CreateReceiptPayload) {
    return apiClient.post('/receipts', payload)
  },

  /**
   * Get all receipts
   */
  async getReceipts(page = 1, limit = 20) {
    return apiClient.get(`/receipts?page=${page}&limit=${limit}`)
  },

  /**
   * Get receipt details
   */
  async getReceipt(id: string) {
    return apiClient.get(`/receipts/${id}`)
  },

  /**
   * Print receipt
   */
  async printReceipt(id: string) {
    return apiClient.get(`/receipts/${id}/print`)
  },

  /**
   * Download receipt PDF
   */
  async downloadReceiptPDF(id: string) {
    return apiClient.get(`/receipts/${id}/pdf`)
  },

  /**
   * Resend receipt to VSDC
   */
  async resendReceipt(id: string) {
    return apiClient.post(`/receipts/${id}/resend`)
  },

  /**
   * Get receipt statistics
   */
  async getReceiptStats() {
    return apiClient.get('/receipts/stats/summary')
  },
}
