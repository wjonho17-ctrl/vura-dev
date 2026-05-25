import { useState, useCallback } from 'react'
import AppShell from '../../components/layout/AppShell'
import { operatorApi } from '../../api/operator'
import { logActivity } from '../../hooks/useActivityLog'
import { useApp } from '../../context/AppContext'

const EMPTY_MASTER = { itemCode: '', remainQuantity: '' }

export default function StockMaster() {
  const { rawUser } = useApp()
  const branchId = rawUser?.branchId || ''

  const [masterForm, setMasterForm] = useState(EMPTY_MASTER)
  const [masterSaving, setMasterSaving] = useState(false)
  const [masterErr, setMasterErr] = useState(null)
  const [masterOk, setMasterOk] = useState(false)

  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState(null)

  // Search state
  const [searching, setSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [itemList, setItemList] = useState([])

  const searchItems = useCallback(async (q) => {
    setSearchQuery(q)
    if (!q || q.length < 2) { setItemList([]); return }
    setSearching(true)
    try {
      const res = await operatorApi.searchItems(q, 1, 15)
      setItemList(res?.data || res?.items?.data || [])
    } catch { setItemList([]) }
    finally { setSearching(false) }
  }, [])

  async function handleMaster(e) {
    e.preventDefault(); setMasterErr(null); setMasterSaving(true); setMasterOk(false)
    try {
      await operatorApi.saveMaster({
        itemCode: masterForm.itemCode,
        remainQuantity: Number(masterForm.remainQuantity),
        branchId,
      })
      logActivity({ action: 'STOCK_MASTER', category: 'Inventory', summary: `Stock Audit: Reset ${masterForm.itemCode} to ${masterForm.remainQuantity}` })
      setMasterOk(true); setMasterForm(EMPTY_MASTER); setSearchQuery('')
      setTimeout(() => setMasterOk(false), 5000)
    } catch (err) {
      setMasterErr(err.data?.errors?.[0]?.message || err.message || 'Operation failed')
    } finally { setMasterSaving(false) }
  }

  async function handleSync() {
    setSyncing(true); setSyncMsg(null)
    try {
      await operatorApi.syncStock()
      setSyncMsg('Stock levels synchronized with RRA successfully.')
    } catch (err) { setSyncMsg(`Sync failed: ${err.message}`) }
    finally { setSyncing(false) }
  }

  return (
    <AppShell>
      <div className="page">
        <div className="page-head">
          <div>
            <div className="crumbs"><span>Workspace</span><span>›</span><span>Stock</span></div>
            <h1>Inventory Count</h1>
          </div>
          <div className="page-head__actions">
            <button className="btn btn--primary" onClick={handleSync} disabled={syncing}>
              {syncing ? 'Syncing...' : 'Sync Stock from RRA'}
            </button>
          </div>
        </div>

        {syncMsg && <div className="settings-error" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: 'var(--ok)', marginBottom: 24 }}>{syncMsg}</div>}

        <div className="card">
          <div className="card__head">
            <div>
              <h3 style={{ margin: 0 }}>Stock Reconciliation</h3>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--ink-500)' }}>Manually set physical stock levels to match your system</p>
            </div>
          </div>
          <div className="card__body" style={{ padding: 32 }}>
            {masterErr && <div className="settings-error" style={{ marginBottom: 24 }}>{masterErr}</div>}
            {masterOk && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 16, color: 'var(--ok)', marginBottom: 24, fontWeight: 600 }}>✓ Inventory count updated successfully</div>}

            <form onSubmit={handleMaster}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 32px' }}>
                
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Search Product <span style={{ color: 'var(--err)' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input className="form-input" placeholder="Type product name or code to search..." 
                      value={searchQuery}
                      onChange={e => searchItems(e.target.value)} />
                    {searching && <div className="spinner-sm" style={{ position: 'absolute', right: 12, top: 12 }} />}
                    
                    {searchQuery.length >= 2 && !searching && (
                      <div className="card" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, marginTop: 4, maxHeight: 250, overflowY: 'auto', border: '1px solid var(--ink-200)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
                        {itemList.length === 0 ? (
                           <div style={{ padding: '16px', textAlign: 'center', color: 'var(--ink-400)', fontSize: 13 }}>No products matching "{searchQuery}"</div>
                        ) : itemList.map(it => (
                          <div key={it.id} className="item-select-row" style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            onClick={() => {
                              setMasterForm(f => ({ ...f, itemCode: it.code }))
                              setSearchQuery(it.name)
                              setItemList([])
                            }}>
                            <div>
                               <div style={{ fontWeight: 600, fontSize: 14 }}>{it.name}</div>
                               <div className="mono" style={{ fontSize: 11, color: 'var(--ink-500)' }}>{it.code}</div>
                            </div>
                            <span className="chip chip--plain" style={{ fontSize: 11 }}>{it.taxTypeCode}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">RRA Item Code</label>
                  <input className="form-input mono" required readOnly value={masterForm.itemCode} placeholder="Select a product above" style={{ background: 'var(--ink-50)' }} />
                </div>

                <div className="form-group">
                  <label className="form-label">Physical Quantity Counted</label>
                  <input className="form-input mono" type="number" min="0" required value={masterForm.remainQuantity} onChange={e => setMasterForm({ ...masterForm, remainQuantity: e.target.value })} />
                </div>
              </div>
              
              <div style={{ marginTop: 32, padding: 16, background: 'var(--ink-50)', borderRadius: 12, fontSize: 13, color: 'var(--ink-600)' }}>
                <b>Important:</b> This action directly sets the quantity in the VSDC server. Only use this for reconciliation after a physical audit.
              </div>
              
              <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--ink-100)', paddingTop: 24 }}>
                <button type="submit" className="btn btn--lg btn--primary" style={{ padding: '0 40px' }} disabled={masterSaving || !masterForm.itemCode}>
                  {masterSaving ? 'Updating...' : 'Update Count'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
