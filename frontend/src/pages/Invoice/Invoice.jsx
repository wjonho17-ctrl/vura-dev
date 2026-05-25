import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { operatorApi } from '../../api/operator'
import { logActivity } from '../../hooks/useActivityLog'
import RraLogo from '../../components/ui/RraLogo'

const PAYMENT_METHODS = [
  { v: '01', l: 'Cash' }, { v: '02', l: 'Credit' }, { v: '03', l: 'Cash/Credit' },
  { v: '04', l: 'Bank Cheque' }, { v: '05', l: 'Debit/Credit Card' },
  { v: '06', l: 'Mobile Money' }, { v: '07', l: 'Other' },
]
const REFUND_REASONS = [
  { v: '01', l: 'Missing quantity' }, { v: '02', l: 'Missing item' },
  { v: '03', l: 'Damaged goods' }, { v: '04', l: 'Wasted goods' },
  { v: '05', l: 'Raw material shortage' }, { v: '06', l: 'General refund' },
  { v: '07', l: 'Wrong customer TIN' }, { v: '08', l: 'Wrong customer name' },
  { v: '09', l: 'Wrong amount/price' }, { v: '10', l: 'Wrong quantity' },
  { v: '11', l: 'Wrong items' }, { v: '12', l: 'Wrong tax type' }, { v: '13', l: 'Other' },
]

function toEbmDate(isoStr) {
  const d = new Date(isoStr || Date.now())
  return {
    year:   String(d.getFullYear()),
    month:  String(d.getMonth() + 1).padStart(2, '0'),
    day:    String(d.getDate()).padStart(2, '0'),
    hour:   String(d.getHours()).padStart(2, '0'),
    minute: String(d.getMinutes()).padStart(2, '0'),
    second: String(d.getSeconds()).padStart(2, '0'),
  }
}

function SaleLabel({ saleType, receiptType }) {
  const label = `${saleType}${receiptType}`
  const colors = { NS: 'chip--ok', NR: 'chip--warn', CS: 'chip--info', CR: 'chip--warn', TS: 'chip--brand', TR: 'chip--warn', PS: 'chip--brand', RS: 'chip--danger' }
  return <span className={`chip ${colors[label] || ''}`}>{label}</span>
}

export default function Invoice() {
  const navigate = useNavigate()

  const [sales,    setSales]    = useState([])
  const [meta,     setMeta]     = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [tab,      setTab]      = useState('All')
  const [counters, setCounters] = useState(null)

  const [findId,      setFindId]      = useState('')
  const [findLoading, setFindLoading] = useState(false)

  const [branchId,      setBranchId]      = useState('')
  const [branchSales,   setBranchSales]   = useState([])
  const [branchLoading, setBranchLoading] = useState(false)

  const [refundSale,   setRefundSale]   = useState(null)
  const [refundForm,   setRefundForm]   = useState({ refundReason: '06', itemsReceived: 'Y', purchaseCode: '', stockReleaseDate: '', itemSequences: '' })
  const [refundSaving, setRefundSaving] = useState(false)
  const [refundErr,    setRefundErr]    = useState(null)
  const [lockChecking, setLockChecking] = useState(false)

  const [receiptSale,  setReceiptSale]  = useState(null)
  const [receiptExtra, setReceiptExtra] = useState(null)
  const [receiptMode,  setReceiptMode]  = useState('A4')

  function openReceipt(sale) {
    setReceiptSale(sale)
    setReceiptExtra(null)
    operatorApi.receiptById(sale.id)
      .then(data => setReceiptExtra(data))
      .catch(() => {})
  }

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError(null)
    try {
      const res = await operatorApi.listSales(page)
      const data = res?.data ?? res ?? []
      setSales(Array.isArray(data) ? data : data?.data ?? [])
      setMeta(res?.meta ?? null)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { operatorApi.receiptCounters().then(setCounters).catch(() => {}) }, [])

  async function checkLockAndRefund(s) {
    setLockChecking(true)
    try {
      const r = await operatorApi.lockCheck(s.id)
      if (r?.locked) { alert(`Sale #${s.invoiceNo} is locked and cannot be refunded.`); return }
    } catch { /* ignore */ }
    finally { setLockChecking(false) }
    setRefundSale(s)
    setRefundForm({ refundReason: '06', itemsReceived: 'Y', purchaseCode: '', stockReleaseDate: '', itemSequences: '' })
    setRefundErr(null)
  }

  async function handleRefund(e) {
    e.preventDefault(); setRefundErr(null); setRefundSaving(true)
    try {
      const now = new Date().toISOString()
      const payload = {
        saleId: refundSale.id,
        refundReason: refundForm.refundReason,
        itemsReceived: refundForm.itemsReceived,
        stockReleaseDate: toEbmDate(refundForm.stockReleaseDate || now),
        confirmationDate: toEbmDate(now),
      }
      if (refundForm.purchaseCode) payload.purchaseCode = refundForm.purchaseCode
      if (refundForm.itemSequences.trim()) {
        payload.itemSequences = refundForm.itemSequences.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n))
      }
      const res = await operatorApi.refundSale(payload)
      logActivity({ action: 'REFUND_SALE', category: 'System', summary: `Refunded sale #${refundSale.invoiceNo}` })
      setRefundSale(null); load()
      if (res?.id) openReceipt(res)
    } catch (err) {
      setRefundErr(err.data?.errors?.[0]?.message || err.message)
    } finally { setRefundSaving(false) }
  }

  async function handleFind(e) {
    e.preventDefault()
    if (!findId.trim()) return
    setFindLoading(true)
    try {
      const res = await operatorApi.findSale(findId.trim())
      if (res) openReceipt(res)
      else alert('Sale not found')
    } catch (err) { alert(err.message) }
    finally { setFindLoading(false) }
  }

  async function loadBranchSales() {
    if (!branchId.trim()) return
    setBranchLoading(true)
    try {
      const res = await operatorApi.branchTransactions(branchId.trim())
      setBranchSales(Array.isArray(res) ? res : res?.data ?? [])
    } catch (err) { alert(err.message) }
    finally { setBranchLoading(false) }
  }

  async function handleCopy(sale) {
    try {
      const res = await operatorApi.copySale({ orginalInvoiceNo: sale.invoiceNo, purchaseCode: sale.purchaseCode || undefined })
      logActivity({ action: 'COPY_SALE', category: 'System', summary: `Copied sale #${sale.invoiceNo} → new #${res.invoiceNo}` })
      load()
      if (res?.id) openReceipt(res)
    } catch (err) { alert(err.message) }
  }

  function printReceipt() {
    if (!receiptSale) return
    const content = document.getElementById('receipt-content').innerHTML
    const win = window.open('', '', 'width=900,height=900')
    win.document.write(`<html><head><title>Invoice #${receiptSale.invoiceNo}</title><style>
      body{font-family:'Inter',sans-serif;margin:0;padding:40px;color:#111}
      .receipt-container{width:100%;max-width:800px;margin:0 auto}
      table{width:100%;border-collapse:collapse;margin:20px 0}
      th,td{border:1px solid #ddd;padding:10px;text-align:left;font-size:12px}
      th{background:#f9fafb;font-weight:600}
      .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;border-bottom:2px solid #0055A4;padding-bottom:20px}
      @media print{body{padding:0}.no-print{display:none}}
    </style></head><body>
      <div class="receipt-container">${content}</div>
      <script>window.print();setTimeout(()=>window.close(),500);</script>
    </body></html>`)
    win.document.close()
  }

  const filtered = tab === 'By Branch'
    ? branchSales
    : sales.filter(s => {
        if (tab === 'Normal')   return s.saleType === 'N'
        if (tab === 'Training') return s.saleType === 'T'
        if (tab === 'Proforma') return s.saleType === 'P'
        if (tab === 'Refunds')  return s.receiptType === 'R'
        return true
      })

  const total       = meta?.total ?? sales.length
  const totalPages  = meta ? meta.lastPage ?? Math.ceil(meta.total / 12) : 1
  const currentPage = meta?.page ?? 1

  const qrData = receiptSale
    ? `${receiptSale.saleDate}#${receiptSale.confirmationDate?.hour}:${receiptSale.confirmationDate?.minute}#${receiptExtra?.sdcId || receiptSale.ebmSaleData?.sdcId || '—'}#${receiptSale.invoiceNo}#${receiptExtra?.internalData || receiptSale.ebmSaleData?.intrlData || '—'}#${receiptExtra?.signature || receiptSale.ebmSaleData?.rcptSign || '—'}`
    : ''
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`

  return (
    <AppShell>
      <div className="page">
        <div className="page-head">
          <div>
            <div className="crumbs"><span>Home</span><span>›</span><span>Invoices</span></div>
            <h1>Sales &amp; Invoices</h1>
          </div>
          <div className="page-head__actions">
            <form onSubmit={handleFind} style={{ display: 'flex', gap: 6 }}>
              <input className="form-input form-input--sm input--mono" placeholder="Find by sale ID…"
                value={findId} onChange={e => setFindId(e.target.value)} style={{ width: 160 }} />
              <button type="submit" className="btn btn--sm" disabled={findLoading}>
                {findLoading ? '…' : 'Find'}
              </button>
            </form>
            <button className="btn"
              onClick={() => operatorApi.lastReceipt().then(r => alert(`Last receipt: #${r.invoiceNo}`)).catch(e => alert(e.message))}>
              Last Receipt
            </button>
            <button className="btn btn--primary" onClick={() => navigate('/invoice/new')}>
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
              </svg>
              New Invoice
            </button>
          </div>
        </div>

        {/* KPI counters */}
        {counters && (
          <div className="kpi-grid">
            <div className="kpi"><div className="kpi__label">Sales (NS)</div><div className="kpi__value">{counters.lastSaleInvoiceNo ?? 0}</div><span className="kpi__sub">last invoice no</span></div>
            <div className="kpi"><div className="kpi__label">Training (TS)</div><div className="kpi__value">{counters.lastTrainingInvoiceNo ?? 0}</div><span className="kpi__sub">last training no</span></div>
            <div className="kpi"><div className="kpi__label">Proforma (PS)</div><div className="kpi__value">{counters.lastProformaInvoiceNo ?? 0}</div><span className="kpi__sub">last proforma no</span></div>
            <div className="kpi"><div className="kpi__label">Copies (CS)</div><div className="kpi__value">{counters.lastCopyInvoiceNo ?? 0}</div><span className="kpi__sub">last copy no</span></div>
          </div>
        )}

        {/* Refund modal */}
        {refundSale && (
          <div className="modal-backdrop" onClick={() => setRefundSale(null)}>
            <div className="modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
              <div className="modal__head">
                <div>
                  <div style={{ fontSize: 11, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Refund</div>
                  <h3 style={{ margin: 0 }}>Invoice #{refundSale.invoiceNo}</h3>
                </div>
                <button className="modal__close" onClick={() => setRefundSale(null)} aria-label="Close">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/></svg>
                </button>
              </div>
              <div className="modal__body">
                {refundErr && <div className="settings-error">{refundErr}</div>}
                <form onSubmit={handleRefund}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="refReason">Refund Reason *</label>
                    <select id="refReason" className="form-input" value={refundForm.refundReason}
                      onChange={e => setRefundForm(f => ({ ...f, refundReason: e.target.value }))}>
                      {REFUND_REASONS.map(r => <option key={r.v} value={r.v}>{r.v} — {r.l}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="refItemsRec">Items Physically Returned? *</label>
                    <select id="refItemsRec" className="form-input" value={refundForm.itemsReceived}
                      onChange={e => setRefundForm(f => ({ ...f, itemsReceived: e.target.value }))}>
                      <option value="Y">Yes (Y)</option>
                      <option value="N">No (N)</option>
                    </select>
                  </div>
                  {refundSale.customerTin && (
                    <div className="form-group">
                      <label className="form-label" htmlFor="refPurchCode">Purchase Code (6 chars)</label>
                      <input id="refPurchCode" className="form-input input--mono" maxLength={6} value={refundForm.purchaseCode}
                        onChange={e => setRefundForm(f => ({ ...f, purchaseCode: e.target.value }))} />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label" htmlFor="refStockDate">Stock Release Date/Time</label>
                    <input id="refStockDate" type="datetime-local" className="form-input"
                      value={refundForm.stockReleaseDate}
                      onChange={e => setRefundForm(f => ({ ...f, stockReleaseDate: e.target.value }))} />
                    <span className="form-hint">Leave blank to use current time</span>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="refItemSeq">Item Sequences (partial refund)</label>
                    <input id="refItemSeq" className="form-input input--mono" placeholder="e.g. 1, 3 — blank = full refund"
                      value={refundForm.itemSequences}
                      onChange={e => setRefundForm(f => ({ ...f, itemSequences: e.target.value }))} />
                    <span className="form-hint">Comma-separated line item numbers to refund partially</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <button type="submit" className="btn btn--danger" disabled={refundSaving}>{refundSaving ? 'Processing…' : 'Issue Refund'}</button>
                    <button type="button" className="btn" onClick={() => setRefundSale(null)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Receipt modal */}
        {receiptSale && (
          <div className="modal-backdrop" onClick={() => setReceiptSale(null)}>
            <div className="modal" style={{ maxWidth: receiptMode === 'A4' ? 880 : 420, borderRadius: 16 }} onClick={e => e.stopPropagation()}>
              <div className="modal__head" style={{ borderBottom: '1px solid var(--ink-100)', padding: '16px 24px' }}>
                <div className="tab-bar tab-bar--sm">
                  <button className={receiptMode === 'A4' ? 'is-active' : ''} onClick={() => setReceiptMode('A4')}>A4 Invoice</button>
                  <button className={receiptMode === 'Thermal' ? 'is-active' : ''} onClick={() => setReceiptMode('Thermal')}>Thermal 80mm</button>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn--sm" onClick={printReceipt}>Print / PDF</button>
                  <button className="modal__close" onClick={() => setReceiptSale(null)}>✕</button>
                </div>
              </div>

              <div className="modal__body" id="receipt-content" style={{ padding: receiptMode === 'A4' ? '40px 48px' : '24px', background: '#fff', color: '#000' }}>
                {receiptMode === 'A4' ? (
                  <div style={{ fontFamily: 'Arial, sans-serif' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, borderBottom: '2px solid #0055A4', paddingBottom: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <RraLogo size={80} />
                        <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: 24 }}>
                          <h1 style={{ margin: 0, color: '#0055A4', fontSize: 26, letterSpacing: '-0.02em' }}>{receiptSale.registrantName}</h1>
                          <div style={{ fontSize: 13, marginTop: 4, color: '#444' }}>TIN: <b>{receiptSale.tin}</b> | MRC: <b>{receiptExtra?.mrcNo || '—'}</b></div>
                          <div style={{ fontSize: 13, color: '#666' }}>{receiptSale.receipt?.address || 'Kigali, Rwanda'}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 32, fontWeight: 900, color: '#0055A4', opacity: 0.1, marginBottom: -10 }}>INVOICE</div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>No: {receiptSale.invoiceNo}</div>
                        <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>Date: {receiptSale.saleDate}</div>
                        <div style={{ marginTop: 10 }}><SaleLabel saleType={receiptSale.saleType} receiptType={receiptSale.receiptType} /></div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 32 }}>
                      <div style={{ background: '#f8fafc', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>Customer Details</div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{receiptSale.customerName || 'Walk-in Customer'}</div>
                        {receiptSale.customerTin && <div style={{ fontSize: 13, marginTop: 4 }}>TIN: <b>{receiptSale.customerTin}</b></div>}
                      </div>
                      <div style={{ background: '#f8fafc', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>Payment Info</div>
                        <div style={{ fontSize: 14 }}>Method: <b>{PAYMENT_METHODS.find(p => p.v === receiptSale.paymentMethod)?.l}</b></div>
                        <div style={{ fontSize: 14, marginTop: 4 }}>Status: <b style={{ color: '#16a34a' }}>PAID</b></div>
                      </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
                      <thead>
                        <tr style={{ background: '#0055A4', color: '#fff' }}>
                          {['No','Description','Qty','Unit Price','Discount','Total'].map(h => (
                            <th key={h} style={{ padding: '12px 15px', textAlign: h === 'No' || h === 'Description' ? 'left' : 'right', border: 'none' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(receiptSale.items?.data || []).map((item, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '12px 15px' }}>{i + 1}</td>
                            <td style={{ padding: '12px 15px' }}>
                              <div style={{ fontWeight: 600 }}>{item.name}</div>
                              <div style={{ fontSize: 10, color: '#666' }}>Code: {item.code} | Tax: {item.taxationType}</div>
                            </td>
                            <td style={{ padding: '12px 15px', textAlign: 'right' }}>{item.quantity} {item.quantityUnit}</td>
                            <td style={{ padding: '12px 15px', textAlign: 'right' }}>{Number(item.price).toLocaleString()}</td>
                            <td style={{ padding: '12px 15px', textAlign: 'right', color: '#dc2626' }}>{Number(item.discountAmount || 0).toLocaleString()}</td>
                            <td style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 700 }}>{Number(item.totalAmount || (item.quantity * item.price)).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ width: '50%' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 10 }}>Tax Analysis Summary</div>
                        <table style={{ width: '100%', fontSize: 11, border: '1px solid #e2e8f0' }}>
                          <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                              <th style={{ padding: 6 }}>Type</th>
                              <th style={{ padding: 6, textAlign: 'right' }}>Taxable</th>
                              <th style={{ padding: 6, textAlign: 'right' }}>Tax Amt</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[['A','taxableAmountA','taxAmountA'],['B','taxableAmountB','taxAmountB'],['C','taxableAmountC','taxAmountC'],['D','taxableAmountD','taxAmountD']]
                              .filter(([,ta]) => Number(receiptSale[ta]) > 0)
                              .map(([type, ta, tx]) => (
                                <tr key={type}>
                                  <td style={{ padding: 6 }}>Category {type}</td>
                                  <td style={{ padding: 6, textAlign: 'right' }}>{Number(receiptSale[ta]).toLocaleString()}</td>
                                  <td style={{ padding: 6, textAlign: 'right' }}>{Number(receiptSale[tx]).toLocaleString()}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ width: '40%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                          <span style={{ color: '#64748b' }}>Subtotal</span>
                          <span style={{ fontWeight: 600 }}>{(Number(receiptSale.totalAmount) - Number(receiptSale.totalTaxAmount)).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                          <span style={{ color: '#64748b' }}>Total VAT</span>
                          <span style={{ fontWeight: 600 }}>{Number(receiptSale.totalTaxAmount).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', background: '#f8fafc', margin: '8px 0', borderRadius: 8 }}>
                          <span style={{ fontWeight: 700, paddingLeft: 12 }}>GRAND TOTAL</span>
                          <span style={{ fontWeight: 900, color: '#0055A4', paddingRight: 12, fontSize: 18 }}>{Number(receiptSale.totalAmount).toLocaleString()} RWF</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 48, display: 'flex', gap: 32, alignItems: 'center', borderTop: '1px dashed #e2e8f0', paddingTop: 32 }}>
                      <img src={qrUrl} alt="Verification QR" style={{ width: 100, height: 100, border: '4px solid #f1f5f9', borderRadius: 8 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Verification Signature</div>
                        <div style={{ fontSize: 12, fontFamily: 'monospace', wordBreak: 'break-all', background: '#f1f5f9', padding: 8, borderRadius: 4 }}>
                          {receiptExtra?.signature || receiptSale.ebmSaleData?.rcptSign || 'WAITING_FOR_SIGNATURE'}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>
                          Scan the QR code or visit RRA portal to verify this legal document.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontFamily: 'monospace', fontSize: 13, textAlign: 'center' }}>
                    <RraLogo size={50} type="mono" />
                    <div style={{ fontWeight: 700, fontSize: 15, margin: '8px 0' }}>{receiptSale.registrantName}</div>
                    <div>TIN: {receiptSale.tin}</div>
                    <div style={{ margin: '10px 0', borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '5px 0' }}>
                      <b>{receiptSale.saleType}{receiptSale.receiptType} RECEIPT</b>
                    </div>
                    <div style={{ textAlign: 'left', margin: '10px 0' }}>
                      <div>No: {receiptSale.invoiceNo}</div>
                      <div>Date: {receiptSale.saleDate}</div>
                      <div>Cust: {receiptSale.customerName || 'Walk-in'}</div>
                    </div>
                    <div style={{ borderBottom: '1px solid #000', margin: '10px 0' }} />
                    <table style={{ width: '100%', fontSize: 12 }}>
                      <tbody>
                        {(receiptSale.items?.data || []).map((item, i) => (
                          <tr key={i}>
                            <td style={{ textAlign: 'left' }}>{item.name}</td>
                            <td style={{ textAlign: 'right' }}>{item.quantity} x {Number(item.price).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ borderTop: '1px solid #000', margin: '10px 0', paddingTop: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700 }}>
                        <span>TOTAL</span><span>{Number(receiptSale.totalAmount).toLocaleString()}</span>
                      </div>
                    </div>
                    <div style={{ marginTop: 20 }}>
                      <img src={qrUrl} alt="QR" style={{ width: 120 }} />
                      <div style={{ fontSize: 10, marginTop: 10, wordBreak: 'break-all' }}>
                        {receiptExtra?.signature || receiptSale.ebmSaleData?.rcptSign}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sales table */}
        <div className="card">
          <div className="filterbar">
            <div className="tab-bar">
              {['All', 'Normal', 'Training', 'Proforma', 'Refunds', 'By Branch'].map(t => (
                <button key={t} className={tab === t ? 'is-active' : ''} onClick={() => setTab(t)}>{t}</button>
              ))}
            </div>
            {tab === 'By Branch' && (
              <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', alignItems: 'center' }}>
                <input className="form-input form-input--sm input--mono" placeholder="Branch ID (e.g. 00)"
                  value={branchId} onChange={e => setBranchId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadBranchSales()} style={{ width: 160 }} />
                <button className="btn btn--sm btn--primary" onClick={loadBranchSales} disabled={branchLoading}>
                  {branchLoading ? 'Loading…' : 'Load'}
                </button>
              </div>
            )}
          </div>

          <div className="table-wrap">
            {error && <div className="settings-error" style={{ margin: 16 }}>{error}</div>}
            {(loading && tab !== 'By Branch') || (branchLoading && tab === 'By Branch') ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-500)' }}>
                {tab === 'By Branch' ? 'Loading branch transactions…' : 'Loading invoices…'}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-500)' }}>
                No invoices found.
                <div style={{ marginTop: 12 }}>
                  <button className="btn btn--primary btn--sm" onClick={() => navigate('/invoice/new')}>Create First Invoice</button>
                </div>
              </div>
            ) : (
              <table className="data">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Type</th>
                    <th>Customer</th>
                    <th>Payment</th>
                    <th className="num">Total</th>
                    <th className="num">VAT</th>
                    <th>Date</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id}>
                      <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{s.invoiceNo}</span></td>
                      <td><SaleLabel saleType={s.saleType} receiptType={s.receiptType} /></td>
                      <td style={{ fontSize: 13 }}>
                        <div>{s.customerName || 'Walk-in'}</div>
                        {s.customerTin && <div style={{ fontSize: 11.5, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{s.customerTin}</div>}
                      </td>
                      <td style={{ fontSize: 12.5 }}>{PAYMENT_METHODS.find(p => p.v === s.paymentMethod)?.l || s.paymentMethod}</td>
                      <td className="num" style={{ fontWeight: 600 }}>{Number(s.totalAmount || 0).toLocaleString()}</td>
                      <td className="num" style={{ color: 'var(--ink-600)' }}>{Number(s.totalTaxAmount || 0).toLocaleString()}</td>
                      <td style={{ fontSize: 12.5, color: 'var(--ink-500)' }}>{s.saleDate ? new Date(s.saleDate).toLocaleDateString() : '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button className="btn btn--sm" onClick={() => openReceipt(s)}>View</button>
                          {s.receiptType !== 'R' && s.saleType !== 'P' && (
                            <button className="btn btn--sm btn--danger" onClick={() => checkLockAndRefund(s)} disabled={lockChecking}>Refund</button>
                          )}
                          {s.saleType === 'N' && s.receiptType === 'S' && (
                            <button className="btn btn--sm" onClick={() => handleCopy(s)}>Copy</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!loading && tab !== 'By Branch' && totalPages > 1 && (
            <div className="pagination">
              <span>Showing {((currentPage - 1) * 12) + 1}–{Math.min(currentPage * 12, total)} of {total}</span>
              <div className="pages">
                <button onClick={() => load(currentPage - 1)} disabled={currentPage <= 1}>‹</button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                  <button key={p} className={p === currentPage ? 'is-active' : ''} onClick={() => load(p)}>{p}</button>
                ))}
                <button onClick={() => load(currentPage + 1)} disabled={currentPage >= totalPages}>›</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
