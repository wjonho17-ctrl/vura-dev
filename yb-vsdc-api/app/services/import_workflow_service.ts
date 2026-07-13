import { DateTime } from 'luxon'
import VsdcApiClient from './vsdc_api_client.js'

interface ImportRequest {
  invoiceNo: string
  supplier: string
  supplierTin?: string
  items: ImportItem[]
  totalAmount: number
}

interface ImportItem {
  itemCode: string
  itemName: string
  quantity: number
  price: number
  classificationCode: string
}

interface ImportRecord {
  id: string
  invoiceNo: string
  supplier: string
  supplierTin?: string
  requestDate: Date
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  items: ImportItem[]
  totalAmount: number
  approvedDate?: Date
  rejectionReason?: string
  createdAt: Date
  updatedAt: Date
}

export default class ImportWorkflowService {
  private vsdc: VsdcApiClient
  private imports: Map<string, ImportRecord> = new Map()

  constructor(vsdc: VsdcApiClient) {
    this.vsdc = vsdc
  }

  async createImportRequest(request: ImportRequest): Promise<ImportRecord> {
    const now = new Date()
    const id = this.generateId()

    const importRecord: ImportRecord = {
      id,
      invoiceNo: request.invoiceNo,
      supplier: request.supplier,
      supplierTin: request.supplierTin,
      requestDate: now,
      status: 'PENDING',
      items: request.items,
      totalAmount: request.totalAmount,
      createdAt: now,
      updatedAt: now,
    }

    this.imports.set(id, importRecord)

    try {
      await this.vsdc.saveImportation({
        invoiceNo: request.invoiceNo,
        supplier: request.supplier,
        supplierTin: request.supplierTin,
        requestDate: now,
        items: request.items,
        totalAmount: request.totalAmount,
      })
    } catch (error) {
      this.imports.delete(id)
      throw new Error(`Failed to submit importation request: ${error.message}`)
    }

    return importRecord
  }

  async getImportRequest(id: string): Promise<ImportRecord | null> {
    return this.imports.get(id) || null
  }

  async listImportRequests(status?: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<ImportRecord[]> {
    const imports = Array.from(this.imports.values())

    if (status) {
      return imports.filter((imp) => imp.status === status)
    }

    return imports.sort((a, b) => b.requestDate.getTime() - a.requestDate.getTime())
  }

  async approveImportRequest(id: string): Promise<ImportRecord> {
    const importRecord = this.imports.get(id)

    if (!importRecord) {
      throw new Error('Import request not found')
    }

    if (importRecord.status !== 'PENDING') {
      throw new Error(`Cannot approve importation with status: ${importRecord.status}`)
    }

    try {
      await this.vsdc.updateImportationStatus(id, 'APPROVED')

      importRecord.status = 'APPROVED'
      importRecord.approvedDate = new Date()
      importRecord.updatedAt = new Date()

      await this.processApprovedImportation(importRecord)

      this.imports.set(id, importRecord)

      return importRecord
    } catch (error) {
      throw new Error(`Failed to approve importation: ${error.message}`)
    }
  }

  async rejectImportRequest(id: string, reason: string): Promise<ImportRecord> {
    const importRecord = this.imports.get(id)

    if (!importRecord) {
      throw new Error('Import request not found')
    }

    if (importRecord.status !== 'PENDING') {
      throw new Error(`Cannot reject importation with status: ${importRecord.status}`)
    }

    try {
      await this.vsdc.updateImportationStatus(id, 'REJECTED')

      importRecord.status = 'REJECTED'
      importRecord.rejectionReason = reason
      importRecord.updatedAt = new Date()

      this.imports.set(id, importRecord)

      return importRecord
    } catch (error) {
      throw new Error(`Failed to reject importation: ${error.message}`)
    }
  }

  async validateImportRequest(request: ImportRequest): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    if (!request.invoiceNo || request.invoiceNo.trim().length === 0) {
      errors.push('Invoice number is required')
    }

    if (!request.supplier || request.supplier.trim().length === 0) {
      errors.push('Supplier name is required')
    }

    if (!request.items || request.items.length === 0) {
      errors.push('At least one item is required')
    }

    if (request.totalAmount <= 0) {
      errors.push('Total amount must be greater than zero')
    }

    request.items?.forEach((item, index) => {
      if (!item.itemCode) {
        errors.push(`Item ${index + 1}: Item code is required`)
      }
      if (!item.itemName) {
        errors.push(`Item ${index + 1}: Item name is required`)
      }
      if (item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than zero`)
      }
      if (item.price <= 0) {
        errors.push(`Item ${index + 1}: Price must be greater than zero`)
      }
      if (!item.classificationCode) {
        errors.push(`Item ${index + 1}: Classification code is required`)
      }
    })

    const expectedTotal = (request.items || []).reduce((sum, item) => sum + item.quantity * item.price, 0)
    if (Math.abs(expectedTotal - request.totalAmount) > 1) {
      errors.push(
        `Total amount mismatch. Expected: ${expectedTotal.toFixed(2)}, Received: ${request.totalAmount.toFixed(2)}`
      )
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  async validateRequestDate(requestDate: Date, previousRequestDate?: Date): Promise<boolean> {
    const current = DateTime.fromJSDate(requestDate)

    if (previousRequestDate) {
      const previous = DateTime.fromJSDate(previousRequestDate)
      return current > previous
    }

    return true
  }

  private async processApprovedImportation(importRecord: ImportRecord): Promise<void> {
    try {
      for (const item of importRecord.items) {
        await this.vsdc.saveStockTransaction({
          itemCode: item.itemCode,
          itemName: item.itemName,
          action: 'IN',
          quantity: item.quantity,
          price: item.price,
          classificationCode: item.classificationCode,
        })
      }
    } catch (error) {
      console.error('Failed to process stock for approved importation:', error)
      throw error
    }
  }

  async getImportationStats(): Promise<{
    total: number
    pending: number
    approved: number
    rejected: number
    totalValue: number
  }> {
    const all = Array.from(this.imports.values())

    return {
      total: all.length,
      pending: all.filter((i) => i.status === 'PENDING').length,
      approved: all.filter((i) => i.status === 'APPROVED').length,
      rejected: all.filter((i) => i.status === 'REJECTED').length,
      totalValue: all.reduce((sum, i) => sum + i.totalAmount, 0),
    }
  }

  async getImportationsBySupplier(supplier: string): Promise<ImportRecord[]> {
    return Array.from(this.imports.values())
      .filter((i) => i.supplier.toLowerCase() === supplier.toLowerCase())
      .sort((a, b) => b.requestDate.getTime() - a.requestDate.getTime())
  }

  async getImportationsBetweenDates(startDate: Date, endDate: Date): Promise<ImportRecord[]> {
    return Array.from(this.imports.values())
      .filter((i) => i.requestDate >= startDate && i.requestDate <= endDate)
      .sort((a, b) => b.requestDate.getTime() - a.requestDate.getTime())
  }

  private generateId(): string {
    return `IMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  async exportImportationReport(format: 'csv' | 'json'): Promise<string> {
    const imports = Array.from(this.imports.values())

    if (format === 'json') {
      return JSON.stringify(imports, null, 2)
    }

    const headers = ['ID', 'Invoice No', 'Supplier', 'Request Date', 'Status', 'Total Amount', 'Items Count']
    const rows = imports.map((i) => [
      i.id,
      i.invoiceNo,
      i.supplier,
      new Date(i.requestDate).toISOString(),
      i.status,
      i.totalAmount.toString(),
      i.items.length.toString(),
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')

    return csv
  }
}
