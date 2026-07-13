import axios, { AxiosInstance } from 'axios'

interface VSDCConfig {
  baseUrl: string
  tin: string
  bhfId: string
  deviceSerialNumber: string
  apiKey?: string
  timeout?: number
}

interface CodesResponse {
  success: boolean
  codes: CodeItem[]
}

interface CodeItem {
  code: string
  category: string
  description: string
}

interface ItemClassificationResponse {
  success: boolean
  classifications: ItemClassification[]
}

interface ItemClassification {
  unspscCode: string
  description: string
  category: string
  taxRate: number
}

interface CustomerData {
  name: string
  tin?: string
  mobileNo?: string
  email?: string
  address?: string
}

interface StockTransaction {
  itemCode: string
  itemName: string
  action: 'IN' | 'OUT'
  quantity: number
  price: number
  classificationCode: string
}

interface SalesTransaction {
  invoiceNo: string
  receiptType: 'S' | 'R' | 'T' | 'P' | 'C'
  saleDate: Date
  customerName: string
  customerTin?: string
  items: SalesItem[]
  totalAmount: number
  taxAmount: number
  paymentMethod: string
}

interface SalesItem {
  itemCode: string
  itemName: string
  quantity: number
  price: number
  taxAmount: number
}

interface ImportationData {
  invoiceNo: string
  supplier: string
  supplierTin?: string
  requestDate: Date
  items: ImportItem[]
  totalAmount: number
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'
}

interface ImportItem {
  itemCode: string
  itemName: string
  quantity: number
  price: number
  classificationCode: string
}

export default class VsdcApiClient {
  private client: AxiosInstance
  private config: VSDCConfig

  constructor(config: VSDCConfig) {
    this.config = config
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-TIN': config.tin,
        'X-BHF-ID': config.bhfId,
        'X-DEVICE-SERIAL': config.deviceSerialNumber,
        ...(config.apiKey && { 'X-API-KEY': config.apiKey }),
      },
    })
  }

  async initializeSystem(): Promise<{ success: boolean; sdcId: string }> {
    try {
      const response = await this.client.post('/initialization', {
        tin: this.config.tin,
        bhf_id: this.config.bhfId,
        device_serial_number: this.config.deviceSerialNumber,
      })

      return {
        success: true,
        sdcId: response.data.sdc_id,
      }
    } catch (error) {
      throw this.handleError('Initialization failed', error)
    }
  }

  async getCodes(): Promise<CodesResponse> {
    try {
      const response = await this.client.get('/codes')

      const codes = response.data.codes || []
      const organized = this.organizeCodesByCategory(codes)

      return {
        success: true,
        codes: organized,
      }
    } catch (error) {
      throw this.handleError('Failed to fetch codes', error)
    }
  }

  async getItemClassifications(): Promise<ItemClassificationResponse> {
    try {
      const response = await this.client.get('/item-classifications')

      return {
        success: true,
        classifications: response.data.classifications || [],
      }
    } catch (error) {
      throw this.handleError('Failed to fetch item classifications', error)
    }
  }

  async saveCustomer(customer: CustomerData): Promise<{ success: boolean; customerId: string }> {
    try {
      const response = await this.client.post('/customers', {
        name: customer.name,
        tin: customer.tin,
        mobile_no: customer.mobileNo,
        email: customer.email,
        address: customer.address,
      })

      return {
        success: true,
        customerId: response.data.customer_id,
      }
    } catch (error) {
      throw this.handleError('Failed to save customer', error)
    }
  }

  async getCustomers(page: number = 1, limit: number = 100): Promise<{ success: boolean; customers: any[] }> {
    try {
      const response = await this.client.get('/customers', {
        params: { page, limit },
      })

      return {
        success: true,
        customers: response.data.customers || [],
      }
    } catch (error) {
      throw this.handleError('Failed to fetch customers', error)
    }
  }

  async saveItem(item: any): Promise<{ success: boolean; itemId: string }> {
    try {
      const response = await this.client.post('/items', {
        code: item.code,
        name: item.name,
        classification_code: item.classificationCode,
        price: item.price,
        tax_type: item.taxType,
      })

      return {
        success: true,
        itemId: response.data.item_id,
      }
    } catch (error) {
      throw this.handleError('Failed to save item', error)
    }
  }

  async getItems(page: number = 1, limit: number = 100): Promise<{ success: boolean; items: any[] }> {
    try {
      const response = await this.client.get('/items', {
        params: { page, limit },
      })

      return {
        success: true,
        items: response.data.items || [],
      }
    } catch (error) {
      throw this.handleError('Failed to fetch items', error)
    }
  }

  async getNotices(): Promise<{ success: boolean; notices: any[] }> {
    try {
      const response = await this.client.get('/notices')

      return {
        success: true,
        notices: response.data.notices || [],
      }
    } catch (error) {
      throw this.handleError('Failed to fetch notices', error)
    }
  }

  async getImportations(status?: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<{ success: boolean; importations: any[] }> {
    try {
      const params = status ? { status } : {}
      const response = await this.client.get('/importations', { params })

      return {
        success: true,
        importations: response.data.importations || [],
      }
    } catch (error) {
      throw this.handleError('Failed to fetch importations', error)
    }
  }

  async saveImportation(importation: ImportationData): Promise<{ success: boolean; importationId: string }> {
    try {
      const response = await this.client.post('/importations', {
        invoice_no: importation.invoiceNo,
        supplier: importation.supplier,
        supplier_tin: importation.supplierTin,
        request_date: importation.requestDate.toISOString(),
        items: importation.items.map((item) => ({
          item_code: item.itemCode,
          item_name: item.itemName,
          quantity: item.quantity,
          price: item.price,
          classification_code: item.classificationCode,
        })),
        total_amount: importation.totalAmount,
      })

      return {
        success: true,
        importationId: response.data.importation_id,
      }
    } catch (error) {
      throw this.handleError('Failed to save importation', error)
    }
  }

  async updateImportationStatus(
    importationId: string,
    status: 'APPROVED' | 'REJECTED'
  ): Promise<{ success: boolean }> {
    try {
      await this.client.patch(`/importations/${importationId}`, {
        status,
      })

      return { success: true }
    } catch (error) {
      throw this.handleError('Failed to update importation status', error)
    }
  }

  async saveSalesTransaction(transaction: SalesTransaction): Promise<{ success: boolean; transactionId: string }> {
    try {
      const response = await this.client.post('/sales-transactions', {
        invoice_no: transaction.invoiceNo,
        receipt_type: transaction.receiptType,
        sale_date: transaction.saleDate.toISOString(),
        customer_name: transaction.customerName,
        customer_tin: transaction.customerTin,
        items: transaction.items.map((item) => ({
          item_code: item.itemCode,
          item_name: item.itemName,
          quantity: item.quantity,
          price: item.price,
          tax_amount: item.taxAmount,
        })),
        total_amount: transaction.totalAmount,
        tax_amount: transaction.taxAmount,
        payment_method: transaction.paymentMethod,
      })

      return {
        success: true,
        transactionId: response.data.transaction_id,
      }
    } catch (error) {
      throw this.handleError('Failed to save sales transaction', error)
    }
  }

  async getPurchases(page: number = 1, limit: number = 100): Promise<{ success: boolean; purchases: any[] }> {
    try {
      const response = await this.client.get('/purchases', {
        params: { page, limit },
      })

      return {
        success: true,
        purchases: response.data.purchases || [],
      }
    } catch (error) {
      throw this.handleError('Failed to fetch purchases', error)
    }
  }

  async updatePurchase(purchaseId: string, data: any): Promise<{ success: boolean }> {
    try {
      await this.client.patch(`/purchases/${purchaseId}`, data)

      return { success: true }
    } catch (error) {
      throw this.handleError('Failed to update purchase', error)
    }
  }

  async saveStockTransaction(transaction: StockTransaction): Promise<{ success: boolean }> {
    try {
      await this.client.post('/stock-transactions', {
        item_code: transaction.itemCode,
        item_name: transaction.itemName,
        action: transaction.action,
        quantity: transaction.quantity,
        price: transaction.price,
        classification_code: transaction.classificationCode,
      })

      return { success: true }
    } catch (error) {
      throw this.handleError('Failed to save stock transaction', error)
    }
  }

  async saveStockMaster(itemCode: string, remainingQuantity: number): Promise<{ success: boolean }> {
    try {
      await this.client.post('/stock-master', {
        item_code: itemCode,
        remaining_quantity: remainingQuantity,
      })

      return { success: true }
    } catch (error) {
      throw this.handleError('Failed to save stock master', error)
    }
  }

  private organizeCodesByCategory(codes: any[]): CodeItem[] {
    return codes.map((code) => ({
      code: code.code,
      category: code.category,
      description: code.description,
    }))
  }

  private handleError(message: string, error: any): Error {
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.message || error.message
      return new Error(`${message}: ${errorMsg}`)
    }
    return new Error(`${message}: ${error.message}`)
  }

  async health(): Promise<{ online: boolean }> {
    try {
      await this.client.get('/health')
      return { online: true }
    } catch {
      return { online: false }
    }
  }
}
