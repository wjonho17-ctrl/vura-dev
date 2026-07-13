import PDFDocument from 'pdfkit'
import { Readable } from 'stream'

interface ReceiptData {
  invoiceNo: string
  receiptType: 'S' | 'R' | 'T' | 'P' | 'C'
  saleDate: Date
  customerName: string
  customerTin?: string
  customerMobileNo?: string
  businessName: string
  businessTin: string
  businessAddress: string
  businessMobileNo: string
  items: ReceiptItem[]
  taxblAmtA: number
  taxblAmtB: number
  taxblAmtC: number
  taxblAmtD: number
  taxAmtA: number
  taxAmtB: number
  taxAmtC: number
  taxAmtD: number
  totalAmount: number
  paymentMethod: string
  sdcId?: string
  rcptSign?: string
  qrCode?: string
  versionNumber: string
}

interface ReceiptItem {
  itemSeq: number
  itemNm: string
  qty: number
  prc: number
  dcAmt: number
  taxTyCd: 'A' | 'B' | 'C' | 'D'
  taxblAmt: number
  taxAmt: number
  totAmt: number
}

export default class PdfGenerationService {
  async generateReceiptPDF(receipt: ReceiptData, format: 'a4' | 'a5' | 'roll' = 'a4'): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = this.createDocument(format)
        const chunks: Buffer[] = []

        doc.on('data', (chunk) => {
          chunks.push(chunk)
        })

        doc.on('end', () => {
          resolve(Buffer.concat(chunks))
        })

        doc.on('error', reject)

        this.renderReceipt(doc, receipt, format)
        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  private createDocument(format: 'a4' | 'a5' | 'roll'): PDFDocument {
    const pageOptions = this.getPageOptions(format)
    return new PDFDocument(pageOptions)
  }

  private getPageOptions(format: string): PDFKit.PDFDocumentOptions {
    const options: Record<string, PDFKit.PDFDocumentOptions> = {
      a4: {
        size: 'A4',
        margin: 40,
      },
      a5: {
        size: 'A5',
        margin: 20,
      },
      roll: {
        size: [80, 600],
        margin: 10,
      },
    }
    return options[format] || options.a4
  }

  private renderReceipt(doc: PDFDocument, receipt: ReceiptData, format: string): void {
    const margin = format === 'roll' ? 10 : 40
    const pageWidth = doc.page.width
    const contentWidth = pageWidth - margin * 2

    let yPos = margin

    yPos = this.renderHeader(doc, receipt, yPos, contentWidth, margin)
    yPos = this.renderReceiptType(doc, receipt, yPos, contentWidth, margin)
    yPos = this.renderMetadata(doc, receipt, yPos, contentWidth, margin)
    yPos = this.renderCustomerInfo(doc, receipt, yPos, contentWidth, margin)
    yPos = this.renderItems(doc, receipt, yPos, contentWidth, margin)
    yPos = this.renderTaxBreakdown(doc, receipt, yPos, contentWidth, margin)
    yPos = this.renderTotals(doc, receipt, yPos, contentWidth, margin)

    if (receipt.receiptType !== 'S') {
      yPos = this.renderWarning(doc, receipt, yPos, contentWidth, margin)
    }

    this.renderFooter(doc, receipt, yPos, contentWidth, margin)
  }

  private renderHeader(doc: PDFDocument, receipt: ReceiptData, yPos: number, width: number, margin: number): number {
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('RRA - VSDC SYSTEM', margin, yPos, { align: 'center' })

    yPos += 20

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(receipt.businessName, margin, yPos, { align: 'center', width })

    yPos += 18

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(receipt.businessAddress, margin, yPos, { align: 'center', width })

    yPos += 15

    doc.fontSize(9).text(receipt.businessMobileNo, margin, yPos, { align: 'center', width })

    yPos += 15

    doc.fontSize(9).text(`TIN: ${receipt.businessTin}`, margin, yPos, { align: 'center', width })

    yPos += 15

    doc.moveTo(margin, yPos).lineTo(margin + width, yPos).stroke()

    yPos += 15

    return yPos
  }

  private renderReceiptType(doc: PDFDocument, receipt: ReceiptData, yPos: number, width: number, margin: number): number {
    const typeLabel = this.getReceiptTypeLabel(receipt.receiptType)
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#d32f2f')
      .text(typeLabel, margin, yPos, { align: 'center', width })

    doc.fillColor('black')

    yPos += 20

    return yPos
  }

  private renderMetadata(doc: PDFDocument, receipt: ReceiptData, yPos: number, width: number, margin: number): number {
    const dateTime = new Date(receipt.saleDate)
    const dateStr = dateTime.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
    const timeStr = dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    doc.fontSize(9).font('Helvetica')

    doc.text(`Receipt #: ${receipt.invoiceNo}`, margin, yPos)
    yPos += 12

    doc.text(`Date: ${dateStr}`, margin, yPos)
    yPos += 12

    doc.text(`Time: ${timeStr}`, margin, yPos)
    yPos += 12

    doc.text(`SDC: ${receipt.sdcId || 'PENDING'}`, margin, yPos)
    yPos += 15

    return yPos
  }

  private renderCustomerInfo(doc: PDFDocument, receipt: ReceiptData, yPos: number, width: number, margin: number): number {
    if (!receipt.customerTin && !receipt.customerMobileNo) {
      return yPos
    }

    doc.fontSize(10).font('Helvetica-Bold').text('CUSTOMER INFORMATION', margin, yPos)

    yPos += 15

    doc.fontSize(9).font('Helvetica').text(`Name: ${receipt.customerName}`, margin, yPos)
    yPos += 12

    if (receipt.customerTin) {
      doc.text(`TIN: ${receipt.customerTin}`, margin, yPos)
      yPos += 12
    }

    if (receipt.customerMobileNo) {
      doc.text(`Mobile: ${receipt.customerMobileNo}`, margin, yPos)
      yPos += 12
    }

    yPos += 10

    return yPos
  }

  private renderItems(doc: PDFDocument, receipt: ReceiptData, yPos: number, width: number, margin: number): number {
    doc.fontSize(10).font('Helvetica-Bold').text('ITEMS', margin, yPos)

    yPos += 15

    doc.fontSize(8).font('Helvetica-Bold')
    doc.text('Description', margin, yPos)
    doc.text('Qty', margin + width - 120, yPos)
    doc.text('Price', margin + width - 80, yPos)
    doc.text('Total', margin + width - 40, yPos, { align: 'right' })

    yPos += 12

    doc.moveTo(margin, yPos).lineTo(margin + width, yPos).stroke()

    yPos += 8

    doc.fontSize(8).font('Helvetica')

    receipt.items.forEach((item) => {
      doc.text(item.itemNm.substring(0, 30), margin, yPos, { width: width - 140 })
      doc.text(item.qty.toString(), margin + width - 120, yPos)
      doc.text(this.formatNumber(item.prc), margin + width - 80, yPos)
      doc.text(this.formatNumber(item.totAmt), margin + width - 40, yPos, { align: 'right' })

      yPos += 12

      if (item.dcAmt > 0) {
        doc.text(`Discount: -${this.formatNumber(item.dcAmt)}`, margin + width - 120, yPos)
        yPos += 10
      }
    })

    yPos += 10

    return yPos
  }

  private renderTaxBreakdown(doc: PDFDocument, receipt: ReceiptData, yPos: number, width: number, margin: number): number {
    doc.fontSize(10).font('Helvetica-Bold').text('TAX BREAKDOWN', margin, yPos)

    yPos += 15

    doc.fontSize(9).font('Helvetica')

    if (receipt.taxblAmtA > 0) {
      doc.text(`Tax A (0%): ${this.formatNumber(receipt.taxblAmtA)} RWF`, margin, yPos)
      yPos += 12
    }

    if (receipt.taxblAmtB > 0) {
      doc.text(`Tax B (18%): ${this.formatNumber(receipt.taxblAmtB)} RWF`, margin, yPos)
      yPos += 12
    }

    if (receipt.taxblAmtC > 0) {
      doc.text(`Tax C (0%): ${this.formatNumber(receipt.taxblAmtC)} RWF`, margin, yPos)
      yPos += 12
    }

    if (receipt.taxblAmtD > 0) {
      doc.text(`Tax D (0%): ${this.formatNumber(receipt.taxblAmtD)} RWF`, margin, yPos)
      yPos += 12
    }

    yPos += 10

    return yPos
  }

  private renderTotals(doc: PDFDocument, receipt: ReceiptData, yPos: number, width: number, margin: number): number {
    const totalTax = receipt.taxAmtA + receipt.taxAmtB + receipt.taxAmtC + receipt.taxAmtD
    const subtotal = receipt.totalAmount - totalTax

    doc.moveTo(margin, yPos).lineTo(margin + width, yPos).stroke()

    yPos += 10

    doc.fontSize(10).font('Helvetica-Bold')

    doc.text(`Subtotal: ${this.formatNumber(subtotal)} RWF`, margin, yPos)
    yPos += 14

    doc.text(`Total Tax: ${this.formatNumber(totalTax)} RWF`, margin, yPos)
    yPos += 14

    doc.fontSize(12).text(`TOTAL: ${this.formatNumber(receipt.totalAmount)} RWF`, margin, yPos)
    yPos += 16

    doc.moveTo(margin, yPos).lineTo(margin + width, yPos).stroke()

    yPos += 15

    doc.fontSize(9).font('Helvetica')

    doc.text(`Payment: ${this.getPaymentMethodLabel(receipt.paymentMethod)}`, margin, yPos)
    yPos += 12

    doc.text(`Receipt Signature: ${receipt.rcptSign || 'PENDING'}`, margin, yPos)
    yPos += 15

    return yPos
  }

  private renderWarning(doc: PDFDocument, receipt: ReceiptData, yPos: number, width: number, margin: number): number {
    yPos += 10

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#d32f2f')

    doc.text('THIS IS NOT AN OFFICIAL RECEIPT', margin, yPos, { align: 'center', width })
    yPos += 14

    const designation = this.getReceiptTypeDesignation(receipt.receiptType)
    doc.text(designation, margin, yPos, { align: 'center', width })
    yPos += 14

    doc.fillColor('black')

    return yPos
  }

  private renderFooter(doc: PDFDocument, receipt: ReceiptData, yPos: number, width: number, margin: number): void {
    doc.fontSize(8).font('Helvetica').text(`Software Version: ${receipt.versionNumber}`, margin, yPos, {
      align: 'center',
      width,
    })

    yPos += 12

    doc.text('Thank you for your purchase!', margin, yPos, { align: 'center', width })
  }

  private formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }

  private getReceiptTypeLabel(type: 'S' | 'R' | 'T' | 'P' | 'C'): string {
    const labels = {
      S: 'NORMAL SALE',
      R: 'NORMAL REFUND',
      T: 'TRAINING RECEIPT',
      P: 'PROFORMA',
      C: 'COPY RECEIPT',
    }
    return labels[type] || 'RECEIPT'
  }

  private getReceiptTypeDesignation(type: 'S' | 'R' | 'T' | 'P' | 'C'): string {
    const designations = {
      S: '',
      R: '[REFUND]',
      T: '[TRAINING]',
      P: '[PROFORMA]',
      C: '[COPY]',
    }
    return designations[type]
  }

  private getPaymentMethodLabel(method: string): string {
    const methods: Record<string, string> = {
      '01': 'Cash',
      '02': 'Credit Card',
      '03': 'Bank Check',
      '04': 'Mobile Payment',
      '05': 'Bank Transfer',
    }
    return methods[method] || method
  }
}
