import { DateTime } from 'luxon'

interface ReceiptData {
  invoiceNo: string
  receiptType: 'S' | 'R' | 'T' | 'P' | 'C'
  saleDate: Date
  saleStatus: string
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
  mrcNo?: string
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

export default class ReceiptTemplateService {
  private readonly TAX_RATES = {
    A: 0.0,
    B: 0.18,
    C: 0.0,
    D: 0.0,
  }

  formatReceiptText(receipt: ReceiptData): string {
    const lines: string[] = []
    const lineWidth = 40

    lines.push(this.centerText('═'.repeat(lineWidth), lineWidth))
    lines.push(this.centerText(receipt.businessName, lineWidth))
    lines.push(this.centerText(receipt.businessAddress, lineWidth))
    lines.push(this.centerText(receipt.businessMobileNo, lineWidth))
    lines.push(this.centerText('═'.repeat(lineWidth), lineWidth))

    lines.push('')
    lines.push(`TIN: ${receipt.businessTin}`)
    lines.push(`SDC: ${receipt.sdcId || 'PENDING'}`)
    lines.push(`MRC: ${receipt.mrcNo || 'N/A'}`)
    lines.push('')

    lines.push(this.getReceiptTypeLabel(receipt.receiptType))
    lines.push(this.centerText('─'.repeat(lineWidth), lineWidth))

    const dateTime = DateTime.fromJSDate(new Date(receipt.saleDate))
    lines.push(`Date: ${dateTime.toFormat('dd/MM/yyyy')}`)
    lines.push(`Time: ${dateTime.toFormat('HH:mm:ss')}`)
    lines.push(`Receipt #: ${receipt.invoiceNo}`)
    lines.push('')

    lines.push('CUSTOMER INFORMATION')
    lines.push('─'.repeat(lineWidth))
    lines.push(`Name: ${receipt.customerName}`)
    if (receipt.customerTin) {
      lines.push(`TIN: ${receipt.customerTin}`)
    }
    if (receipt.customerMobileNo) {
      lines.push(`Mobile: ${receipt.customerMobileNo}`)
    }
    lines.push('')

    lines.push('ITEMS')
    lines.push('─'.repeat(lineWidth))
    lines.push(
      `${this.padRight('Item', 20)} ${this.padRight('Qty', 6)} ${this.padRight('Price', 8)} ${this.padRight('Total', 8)}`
    )
    lines.push('─'.repeat(lineWidth))

    receipt.items.forEach((item) => {
      lines.push(
        `${this.padRight(item.itemNm.substring(0, 20), 20)} ${this.padRight(item.qty.toString(), 6)} ${this.padRight(this.formatNumber(item.prc), 8)} ${this.padRight(this.formatNumber(item.totAmt), 8)}`
      )
      if (item.dcAmt > 0) {
        lines.push(`${''.padEnd(20)} Discount: -${this.formatNumber(item.dcAmt)}`)
      }
    })

    lines.push('─'.repeat(lineWidth))
    lines.push(`Item Count: ${receipt.items.length}`)
    lines.push('')

    lines.push('TAX BREAKDOWN')
    lines.push('─'.repeat(lineWidth))
    if (receipt.taxblAmtA > 0) {
      lines.push(
        `Tax A (0%):   ${this.padLeft(this.formatNumber(receipt.taxblAmtA), 12)} RWF - Tax: ${this.padLeft(this.formatNumber(receipt.taxAmtA), 12)} RWF`
      )
    }
    if (receipt.taxblAmtB > 0) {
      lines.push(
        `Tax B (18%):  ${this.padLeft(this.formatNumber(receipt.taxblAmtB), 12)} RWF - Tax: ${this.padLeft(this.formatNumber(receipt.taxAmtB), 12)} RWF`
      )
    }
    if (receipt.taxblAmtC > 0) {
      lines.push(
        `Tax C (0%):   ${this.padLeft(this.formatNumber(receipt.taxblAmtC), 12)} RWF - Tax: ${this.padLeft(this.formatNumber(receipt.taxAmtC), 12)} RWF`
      )
    }
    if (receipt.taxblAmtD > 0) {
      lines.push(
        `Tax D (0%):   ${this.padLeft(this.formatNumber(receipt.taxblAmtD), 12)} RWF - Tax: ${this.padLeft(this.formatNumber(receipt.taxAmtD), 12)} RWF`
      )
    }
    lines.push('')

    lines.push('TOTALS')
    lines.push('═'.repeat(lineWidth))
    const totalTax = receipt.taxAmtA + receipt.taxAmtB + receipt.taxAmtC + receipt.taxAmtD
    lines.push(`Subtotal:  ${this.padLeft(this.formatNumber(receipt.totalAmount - totalTax), 12)} RWF`)
    lines.push(`Total Tax: ${this.padLeft(this.formatNumber(totalTax), 12)} RWF`)
    lines.push(`TOTAL:     ${this.padLeft(this.formatNumber(receipt.totalAmount), 12)} RWF`)
    lines.push('═'.repeat(lineWidth))
    lines.push('')

    lines.push(`Payment: ${this.getPaymentMethodLabel(receipt.paymentMethod)}`)
    lines.push(`Status: ${receipt.saleStatus === '02' ? 'COMPLETED' : 'PENDING'}`)
    lines.push('')

    if (receipt.receiptType !== 'S') {
      lines.push(this.centerText('─'.repeat(lineWidth), lineWidth))
      lines.push(this.centerText(`THIS IS NOT AN OFFICIAL RECEIPT`, lineWidth))
      lines.push(this.centerText(this.getReceiptTypeDesignation(receipt.receiptType), lineWidth))
      lines.push(this.centerText('─'.repeat(lineWidth), lineWidth))
      lines.push('')
    }

    if (receipt.rcptSign) {
      lines.push(`Receipt Signature: ${receipt.rcptSign}`)
    }

    lines.push(this.centerText('═'.repeat(lineWidth), lineWidth))
    lines.push(this.centerText(`Software Version: ${receipt.versionNumber}`, lineWidth))
    lines.push(this.centerText('Thank you for your purchase!', lineWidth))
    lines.push(this.centerText('═'.repeat(lineWidth), lineWidth))
    lines.push('')

    return lines.join('\n')
  }

  formatHTMLReceipt(receipt: ReceiptData): string {
    const totalTax = receipt.taxAmtA + receipt.taxAmtB + receipt.taxAmtC + receipt.taxAmtD
    const subtotal = receipt.totalAmount - totalTax
    const dateTime = DateTime.fromJSDate(new Date(receipt.saleDate))

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt #${receipt.invoiceNo}</title>
  <style>
    * { margin: 0; padding: 0; }
    body { font-family: 'Courier New', monospace; background: #f5f5f5; padding: 20px; }
    .receipt { background: white; width: 80mm; margin: 0 auto; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
    .business-name { font-weight: bold; font-size: 14px; margin-bottom: 5px; }
    .business-info { font-size: 11px; line-height: 1.4; }
    .receipt-type { text-align: center; font-weight: bold; font-size: 12px; margin: 10px 0; color: #d32f2f; }
    .receipt-meta { font-size: 11px; margin: 10px 0; }
    .meta-row { display: flex; justify-content: space-between; }
    .section-title { font-weight: bold; margin-top: 10px; margin-bottom: 5px; border-bottom: 1px dashed #000; padding-bottom: 5px; }
    .customer-info { font-size: 11px; line-height: 1.4; }
    table { width: 100%; font-size: 11px; margin: 10px 0; border-collapse: collapse; }
    th { border-bottom: 1px solid #000; padding: 5px 0; text-align: left; font-weight: bold; }
    td { padding: 5px 0; }
    .item-name { font-weight: bold; }
    .amount-col { text-align: right; }
    .tax-section { margin: 10px 0; font-size: 11px; }
    .tax-row { display: flex; justify-content: space-between; padding: 3px 0; }
    .totals-section { border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 10px 0; margin: 10px 0; font-weight: bold; }
    .total-row { display: flex; justify-content: space-between; padding: 3px 0; }
    .total-amount { font-size: 14px; margin-top: 5px; }
    .footer { text-align: center; font-size: 10px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #000; }
    .warning { text-align: center; color: #d32f2f; font-weight: bold; font-size: 10px; margin: 10px 0; }
    .rra-logo { text-align: center; font-weight: bold; margin: 10px 0; }
    .qr-section { text-align: center; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="rra-logo">RRA - VSDC</div>
      <div class="business-name">${receipt.businessName}</div>
      <div class="business-info">
        <div>${receipt.businessAddress}</div>
        <div>${receipt.businessMobileNo}</div>
        <div>TIN: ${receipt.businessTin}</div>
        <div>SDC: ${receipt.sdcId || 'PENDING'}</div>
      </div>
    </div>

    <div class="receipt-type">${this.getReceiptTypeLabel(receipt.receiptType)}</div>

    <div class="receipt-meta">
      <div class="meta-row">
        <span>Receipt #: ${receipt.invoiceNo}</span>
        <span>${dateTime.toFormat('dd/MM/yyyy')}</span>
      </div>
      <div class="meta-row">
        <span>Time: ${dateTime.toFormat('HH:mm:ss')}</span>
        <span>Status: ${receipt.saleStatus === '02' ? 'COMPLETED' : 'PENDING'}</span>
      </div>
    </div>

    ${receipt.customerTin || receipt.customerMobileNo ? `
    <div class="section-title">CUSTOMER</div>
    <div class="customer-info">
      <div>${receipt.customerName}</div>
      ${receipt.customerTin ? `<div>TIN: ${receipt.customerTin}</div>` : ''}
      ${receipt.customerMobileNo ? `<div>Mobile: ${receipt.customerMobileNo}</div>` : ''}
    </div>
    ` : ''}

    <div class="section-title">ITEMS</div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="amount-col">Qty</th>
          <th class="amount-col">Price</th>
          <th class="amount-col">Total</th>
        </tr>
      </thead>
      <tbody>
        ${receipt.items.map(item => `
        <tr>
          <td class="item-name">${item.itemNm}</td>
          <td class="amount-col">${item.qty}</td>
          <td class="amount-col">${this.formatNumber(item.prc)}</td>
          <td class="amount-col">${this.formatNumber(item.totAmt)}</td>
        </tr>
        ${item.dcAmt > 0 ? `<tr><td colspan="4" style="text-align: right;">Discount: -${this.formatNumber(item.dcAmt)}</td></tr>` : ''}
        `).join('')}
      </tbody>
    </table>

    <div class="section-title">TAX BREAKDOWN</div>
    <div class="tax-section">
      ${receipt.taxblAmtA > 0 ? `<div class="tax-row"><span>Tax A (0%):</span><span>${this.formatNumber(receipt.taxblAmtA)} RWF</span></div>` : ''}
      ${receipt.taxblAmtB > 0 ? `<div class="tax-row"><span>Tax B (18%):</span><span>${this.formatNumber(receipt.taxblAmtB)} RWF</span></div>` : ''}
      ${receipt.taxblAmtC > 0 ? `<div class="tax-row"><span>Tax C (0%):</span><span>${this.formatNumber(receipt.taxblAmtC)} RWF</span></div>` : ''}
      ${receipt.taxblAmtD > 0 ? `<div class="tax-row"><span>Tax D (0%):</span><span>${this.formatNumber(receipt.taxblAmtD)} RWF</span></div>` : ''}
    </div>

    <div class="totals-section">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>${this.formatNumber(subtotal)} RWF</span>
      </div>
      <div class="total-row">
        <span>Total Tax:</span>
        <span>${this.formatNumber(totalTax)} RWF</span>
      </div>
      <div class="total-row total-amount">
        <span>TOTAL:</span>
        <span>${this.formatNumber(receipt.totalAmount)} RWF</span>
      </div>
    </div>

    <div class="receipt-meta">
      <div>Payment: ${this.getPaymentMethodLabel(receipt.paymentMethod)}</div>
    </div>

    ${receipt.receiptType !== 'S' ? `
    <div class="warning">
      THIS IS NOT AN OFFICIAL RECEIPT<br>
      ${this.getReceiptTypeDesignation(receipt.receiptType)}
    </div>
    ` : ''}

    ${receipt.qrCode ? `
    <div class="qr-section">
      <img src="${receipt.qrCode}" alt="QR Code" style="width: 100px; height: 100px;">
    </div>
    ` : ''}

    <div class="footer">
      <div>Receipt Signature: ${receipt.rcptSign || 'PENDING'}</div>
      <div>Software Version: ${receipt.versionNumber}</div>
      <div style="margin-top: 10px;">Thank you for your purchase!</div>
    </div>
  </div>
</body>
</html>
    `
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

  private formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }

  private centerText(text: string, width: number): string {
    const padding = Math.max(0, Math.floor((width - text.length) / 2))
    return ' '.repeat(padding) + text
  }

  private padRight(text: string, width: number): string {
    return text.padEnd(width)
  }

  private padLeft(text: string, width: number): string {
    return text.padStart(width)
  }
}
