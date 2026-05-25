import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { operatorApi } from '../../api/operator'
import { logActivity } from '../../hooks/useActivityLog'
import { useApp } from '../../context/AppContext'
import ClassificationPicker from '../../components/ui/ClassificationPicker'
import RraLogo from '../../components/ui/RraLogo'

const PAYMENT_METHODS = [
  { v: '01', l: 'Cash' }, { v: '02', l: 'Credit' }, { v: '03', l: 'Cash/Credit' },
  { v: '04', l: 'Bank Cheque' }, { v: '05', l: 'Debit/Credit Card' },
  { v: '06', l: 'Mobile Money' }, { v: '07', l: 'Other' },
]
const TAX_TYPES = ['A', 'B', 'C', 'D']
const QTY_UNITS = ['U','KGM','L','LTR','M','MTR','GRM','KG','DZ','SET','BX','BG','CT','NO']
const EMPTY_ITEM = { code: '', classificationCode: '', name: '', packageUnit: 'CT', packageNo: 1, quantityUnit: 'U', quantity: 1, price: '', discountRate: 0, taxationType: 'B' }
const DRAFT_KEY = 'invoice_draft'

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

export default function NewInvoice() {
  const navigate = useNavigate()
  const { rawUser } = useApp()

  const [saleMode, setSaleMode] = useState('normal')
  const [saleForm, setSaleForm] = useState({
    customerName: '', customerPhone: '', customerTin: '', purchaseCode: '',
    paymentMethod: '01', saleDate: new Date().toISOString().slice(0, 10),
    itemsReceived: 'Y', remark: '',
  })
  const [saleItems, setSaleItems] = useState([{ ...EMPTY_ITEM }])
  const [saving,    setSaving]    = useState(false)
  const [saleErr,   setSaleErr]   = useState(null)
  const [saleResult, setSaleResult] = useState(null)

  const [itemSearches, setItemSearches] = useState([{ q: '', results: [], busy: false }])

  const [pcPanel,    setPcPanel]    = useState(false)
  const [pcBuyerTel, setPcBuyerTel] = useState('')
  const [pcLoading,  setPcLoading]  = useState(false)
  const [pcMsg,      setPcMsg]      = useState(null)

  const [hasDraft,     setHasDraft]     = useState(() => !!localStorage.getItem(DRAFT_KEY))
  const [draftSavedAt, setDraftSavedAt] = useState(null)

  function saveDraft() {
    const draft = { saleForm, saleItems, saleMode, savedAt: new Date().toISOString() }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    setHasDraft(true)
    setDraftSavedAt(draft.savedAt)
  }

  function loadDraft() {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return
    try {
      const d = JSON.parse(raw)
      if (d.saleForm)  setSaleForm(d.saleForm)
      if (d.saleItems) { setSaleItems(d.saleItems); setItemSearches(d.saleItems.map(() => ({ q: '', results: [], busy: false }))) }
      if (d.saleMode)  setSaleMode(d.saleMode)
      setDraftSavedAt(d.savedAt || null)
    } catch {}
  }

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY)
    setHasDraft(false)
    setDraftSavedAt(null)
  }

  function resetForm() {
    setSaleForm({ customerName: '', customerPhone: '', customerTin: '', purchaseCode: '', paymentMethod: '01', saleDate: new Date().toISOString().slice(0, 10), itemsReceived: 'Y', remark: '' })
    setSaleItems([{ ...EMPTY_ITEM }])
    setItemSearches([{ q: '', results: [], busy: false }])
    setSaleMode('normal')
    setSaleResult(null)
    setSaleErr(null)
  }

  function addItem() {
    setSaleItems(i => [...i, { ...EMPTY_ITEM }])
    setItemSearches(s => [...s, { q: '', results: [], busy: false }])
  }
  function removeItem(idx) {
    setSaleItems(i => i.filter((_, j) => j !== idx))
    setItemSearches(s => s.filter((_, j) => j !== idx))
  }
  function setItem(idx, k, v) { setSaleItems(i => i.map((x, j) => j === idx ? { ...x, [k]: v } : x)) }

  function searchRowItem(idx, q) {
    setItemSearches(s => s.map((x, i) => i === idx ? { ...x, q, results: q.length >= 2 ? x.results : [], busy: q.length >= 2 } : x))
    if (q.length < 2) return
    operatorApi.searchItems(q, 1, 8)
      .then(res => setItemSearches(s => s.map((x, i) => i === idx ? { ...x, results: res?.data || res?.items?.data || [], busy: false } : x)))
      .catch(() => setItemSearches(s => s.map((x, i) => i === idx ? { ...x, results: [], busy: false } : x)))
  }

  function pickRowItem(idx, it) {
    setItem(idx, 'code', it.code || '')
    setItem(idx, 'name', it.name || '')
    setItem(idx, 'classificationCode', it.classificationCode || '')
    setItem(idx, 'taxationType', it.taxTypeCode || 'B')
    setItem(idx, 'packageUnit', it.packagingUnitCode || 'CT')
    setItem(idx, 'quantityUnit', it.quantityUnitCode || 'U')
    setItemSearches(s => s.map((x, i) => i === idx ? { q: it.name, results: [], busy: false } : x))
  }

  async function handleGetCode() {
    if (!saleForm.customerTin) { setPcMsg({ err: 'Enter Customer TIN first' }); return }
    if (!pcBuyerTel.trim())    { setPcMsg({ err: 'Enter buyer phone number' }); return }
    saveDraft()
    setPcLoading(true); setPcMsg(null)
    try {
      const res = await operatorApi.purchaseCode({
        buyerTel: pcBuyerTel.trim(),
        buyerTin: String(saleForm.customerTin),
        sellerTin: String(rawUser?.tin || ''),
      })
      setPcMsg({ ok: res.msg || 'Code sent to buyer\'s phone — ask buyer for the code they received.' })
    } catch (err) {
      setPcMsg({ err: err.data?.error || err.message || 'Failed to send purchase code' })
    } finally { setPcLoading(false) }
  }

  async function handleSale(e) {
    e.preventDefault()
    setSaleErr(null); setSaving(true); setSaleResult(null)
    try {
      const now = new Date().toISOString()
      const payload = {
        customerName: saleForm.customerName || 'Walk-in customer',
        paymentMethod: saleForm.paymentMethod,
        saleStatus: '02',
        confirmationDate: toEbmDate(now),
        saleDate: saleForm.saleDate,
        itemsReceived: saleForm.itemsReceived,
        receipt: {
          address: rawUser?.address || '',
          bottomMessage: 'Thank you',
          itemReceived: saleForm.itemsReceived,
        },
        items: saleItems.map(item => ({
          classificationCode: item.classificationCode,
          code: item.code,
          name: item.name,
          packageUnit: item.packageUnit,
          packageNo: Number(item.packageNo),
          quantityUnit: item.quantityUnit,
          quantity: Number(item.quantity),
          price: Number(item.price),
          discountRate: Number(item.discountRate),
          taxationType: item.taxationType,
        })),
      }
      if (saleForm.customerTin) {
        payload.customerTin = Number(saleForm.customerTin)
        if (saleForm.purchaseCode) payload.purchaseCode = saleForm.purchaseCode
      }
      if (saleForm.customerPhone) payload.remark = [saleForm.remark, `Tel: ${saleForm.customerPhone}`].filter(Boolean).join(' | ')
      else if (saleForm.remark) payload.remark = saleForm.remark

      const fn = saleMode === 'training' ? operatorApi.trainingSale
               : saleMode === 'proforma' ? operatorApi.proformaSale
               : operatorApi.createSale
      const res = await fn(payload)
      setSaleResult(res)
      clearDraft()
      logActivity({ action: `CREATE_SALE_${saleMode.toUpperCase()}`, category: 'System', summary: `${saleMode} sale #${res.invoiceNo} — ${res.totalAmount?.toLocaleString()} RWF` })
    } catch (err) {
      const is24hBlock = err.status === 503 || (err.message || '').includes('24 hours')
      const msg = is24hBlock
        ? '⛔ Sales blocked: EBM has been unreachable for over 24 hours. Restore connectivity to resume issuing receipts.'
        : (err.data?.errors?.[0]?.message || err.message)
      setSaleErr(msg)
      logActivity({ action: 'CREATE_SALE', category: 'System', summary: is24hBlock ? '24h offline block triggered' : 'Sale failed', status: 'error', detail: err.message })
    } finally { setSaving(false) }
  }

  const modeTabs = [['normal','Normal (NS)'],['training','Training (TS)'],['proforma','Proforma (PS)']]

  return (
    <AppShell>
      <div className="page">
        <div className="page-head">
          <div>
            <div className="crumbs">
              <span>Home</span><span>›</span>
              <button className="crumb-link" onClick={() => navigate('/invoice')} style={{ all: 'unset', cursor: 'pointer', color: 'var(--brand)' }}>Invoices</button>
              <span>›</span><span>New Invoice</span>
            </div>
            <h1>New Invoice</h1>
          </div>
          <div className="page-head__actions">
            {hasDraft && (
              <button className="btn btn--warn btn--sm"
                onClick={loadDraft}
                title={draftSavedAt ? `Saved ${new Date(draftSavedAt).toLocaleTimeString()}` : 'Load saved draft'}>
                Load Draft
              </button>
            )}
            <button className="btn btn--sm" onClick={saveDraft}>Save Draft</button>
            {hasDraft && (
              <button className="btn btn--sm btn--danger" onClick={clearDraft}>Discard Draft</button>
            )}
            <button className="btn" onClick={() => navigate('/invoice')}>
              ← Back to Invoices
            </button>
          </div>
        </div>

        {/* Success banner */}
        {saleResult && (
          <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 12, padding: '20px 24px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#15803d' }}>
                ✓ Invoice #{saleResult.invoiceNo} issued successfully
              </div>
              <div style={{ fontSize: 13, color: '#166534', marginTop: 6 }}>
                Total: <b>{Number(saleResult.totalAmount || 0).toLocaleString()} RWF</b>
                &nbsp;·&nbsp;VAT: {Number(saleResult.totalTaxAmount || 0).toLocaleString()} RWF
                &nbsp;·&nbsp;Type: {saleResult.saleType}{saleResult.receiptType}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn--sm" onClick={() => navigate('/invoice')}>
                View in History
              </button>
              <button className="btn btn--sm btn--primary" onClick={resetForm}>
                New Invoice
              </button>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card__head">
            <h3 style={{ margin: 0 }}>Invoice Details</h3>
            <div className="tab-bar">
              {modeTabs.map(([v, l]) => (
                <button key={v} className={saleMode === v ? 'is-active' : ''} onClick={() => setSaleMode(v)}>{l}</button>
              ))}
            </div>
          </div>

          <div className="card__body">
            {saleErr && <div className="settings-error">{saleErr}</div>}

            <form onSubmit={handleSale}>
              {/* Customer info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: '0 16px', marginBottom: 4 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="custName">Customer Name</label>
                  <input id="custName" className="form-input" placeholder="Walk-in customer"
                    value={saleForm.customerName} onChange={e => setSaleForm(f => ({ ...f, customerName: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="custPhone">Phone Number</label>
                  <input id="custPhone" className="form-input input--mono" placeholder="07XXXXXXXX" maxLength={12}
                    value={saleForm.customerPhone} onChange={e => setSaleForm(f => ({ ...f, customerPhone: e.target.value }))} />
                </div>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="form-label" htmlFor="custTin" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>TIN <span style={{ fontSize: 11, color: 'var(--ink-400)', fontWeight: 400 }}>(optional — B2B)</span></span>
                    {saleForm.customerTin && (
                      <button type="button" className="btn btn--xs" style={{ fontSize: 11, padding: '1px 8px' }}
                        onClick={() => { setPcPanel(p => !p); setPcMsg(null); if (!pcBuyerTel && saleForm.customerPhone) setPcBuyerTel(saleForm.customerPhone) }}>
                        {pcPanel ? 'Close' : 'Get Code'}
                      </button>
                    )}
                  </label>
                  <input id="custTin" className="form-input input--mono" placeholder="111111111" type="number"
                    value={saleForm.customerTin} onChange={e => setSaleForm(f => ({ ...f, customerTin: e.target.value }))} />
                  {pcPanel && saleForm.customerTin && (
                    <div style={{ marginTop: 8, padding: '10px 12px', background: 'var(--ink-50)', borderRadius: 8, border: '1px solid var(--ink-200)', position: 'absolute', zIndex: 100, width: 320, left: 0 }}>
                      <div style={{ fontSize: 12, color: 'var(--ink-600)', marginBottom: 6 }}>
                        MyRRA sends a code to the buyer's phone. Form auto-saved to draft.
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input className="form-input form-input--sm input--mono" placeholder="Buyer phone (07XXXXXXXX)"
                          maxLength={12} value={pcBuyerTel} onChange={e => setPcBuyerTel(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !pcLoading && handleGetCode()} style={{ flex: 1 }} />
                        <button type="button" className="btn btn--sm btn--primary" disabled={pcLoading} onClick={handleGetCode}>
                          {pcLoading ? 'Sending…' : 'Send'}
                        </button>
                      </div>
                      {pcLoading && (
                        <div style={{ marginTop: 6, fontSize: 12, color: 'var(--ink-500)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', border: '2px solid var(--brand)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                          Connecting to MyRRA portal… up to 30 sec
                        </div>
                      )}
                      {pcMsg?.ok  && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--ok)', fontWeight: 500 }}>{pcMsg.ok}</div>}
                      {pcMsg?.err && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--err)' }}>{pcMsg.err}</div>}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="purchCode">
                    Purchase Code <span style={{ fontSize: 11, color: 'var(--ink-400)', fontWeight: 400 }}>(optional — B2B)</span>
                  </label>
                  <input id="purchCode" className="form-input input--mono" placeholder="From buyer's phone" maxLength={6}
                    value={saleForm.purchaseCode} onChange={e => setSaleForm(f => ({ ...f, purchaseCode: e.target.value }))} />
                </div>
              </div>

              {/* Sale settings */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 16px', marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="payMethod">Payment Method *</label>
                  <select id="payMethod" className="form-input" value={saleForm.paymentMethod}
                    onChange={e => setSaleForm(f => ({ ...f, paymentMethod: e.target.value }))}>
                    {PAYMENT_METHODS.map(p => <option key={p.v} value={p.v}>{p.v} — {p.l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="saleDate">Sale Date *</label>
                  <input id="saleDate" type="date" className="form-input" value={saleForm.saleDate}
                    onChange={e => setSaleForm(f => ({ ...f, saleDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="itemsRec">Items Received *</label>
                  <select id="itemsRec" className="form-input" value={saleForm.itemsReceived}
                    onChange={e => setSaleForm(f => ({ ...f, itemsReceived: e.target.value }))}>
                    <option value="Y">Yes (Y)</option>
                    <option value="N">No (N)</option>
                  </select>
                </div>
              </div>

              {/* Items */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>Items</span>
                  <button type="button" className="btn btn--sm" onClick={addItem}>+ Add Item</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr 1.4fr 72px 72px 72px 60px 36px', gap: 6, marginBottom: 4 }}>
                  {['Product', 'Item Code', 'Classification', 'Qty *', 'Price *', 'Qty Unit', 'Tax', ''].map((h, i) => (
                    <div key={i} style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600 }}>{h}</div>
                  ))}
                </div>
                {saleItems.map((item, idx) => {
                  const srch = itemSearches[idx] || { q: '', results: [], busy: false }
                  return (
                    <div key={idx} style={{ position: 'relative', display: 'grid', gridTemplateColumns: '2fr 1.1fr 1.4fr 72px 72px 72px 60px 36px', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                      <div style={{ position: 'relative' }}>
                        <input className="form-input form-input--sm" placeholder="Search by name or code…"
                          value={srch.q} onChange={e => searchRowItem(idx, e.target.value)} autoComplete="off" />
                        {srch.busy && <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--ink-400)' }}>…</span>}
                        {srch.results.length > 0 && (
                          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, background: 'var(--surface)', border: '1px solid var(--ink-200)', borderRadius: 10, boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12)', marginTop: 2, maxHeight: 220, overflowY: 'auto' }}>
                            {srch.results.map(it => (
                              <div key={it.id} onMouseDown={() => pickRowItem(idx, it)}
                                style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                className="item-select-row">
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: 13 }}>{it.name}</div>
                                  <div style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{it.code}</div>
                                </div>
                                <span className="chip chip--plain" style={{ fontSize: 11 }}>{it.taxTypeCode}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <input className="form-input form-input--sm input--mono" placeholder="Auto-filled" value={item.code}
                        onChange={e => setItem(idx, 'code', e.target.value)} required
                        style={{ background: item.code ? 'var(--ink-50)' : undefined }} />
                      <ClassificationPicker id={`cls-${idx}`} required value={item.classificationCode}
                        onChange={v => setItem(idx, 'classificationCode', v)}
                        onSelect={obj => { if (obj.taxType || obj.taxTyCd) setItem(idx, 'taxationType', obj.taxType || obj.taxTyCd) }} />
                      <input className="form-input form-input--sm input--mono" type="number" min="1" value={item.quantity}
                        onChange={e => setItem(idx, 'quantity', e.target.value)} required />
                      <input className="form-input form-input--sm input--mono" type="number" min="0" placeholder="0" value={item.price}
                        onChange={e => setItem(idx, 'price', e.target.value)} required />
                      <select className="form-input form-input--sm" value={item.quantityUnit} onChange={e => setItem(idx, 'quantityUnit', e.target.value)}>
                        {QTY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                      <select className="form-input form-input--sm" value={item.taxationType} onChange={e => setItem(idx, 'taxationType', e.target.value)}>
                        {TAX_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <button type="button" className="btn btn--sm btn--danger"
                        onClick={() => removeItem(idx)} disabled={saleItems.length === 1}>✕</button>
                    </div>
                  )
                })}
              </div>

              <div style={{ display: 'flex', gap: 10, paddingTop: 8, borderTop: '1px solid var(--ink-100)' }}>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Processing…' : `Issue ${saleMode === 'training' ? 'Training Receipt' : saleMode === 'proforma' ? 'Proforma Invoice' : 'Invoice'}`}
                </button>
                <button type="button" className="btn" onClick={resetForm} disabled={saving}>Reset Form</button>
                <button type="button" className="btn" onClick={() => navigate('/invoice')} disabled={saving}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
