import { useState, useEffect } from 'react'
import { operatorApi } from '../../../api/operator'
import { logActivity } from '../../../hooks/useActivityLog'

export default function ItemCompositionModal({ item, onClose, onSaved }) {
  const [compositions, setCompositions] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  
  // Search state
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)

  // Load existing compositions (if we had an endpoint for it, but for now we'll start fresh or assume we'll implement fetch later)
  // Since we don't have a fetch endpoint yet, we'll just start with an empty list or implement it in the next step.

  async function handleSearch(q) {
    setSearch(q)
    if (q.length < 2) {
      setSearchResults([])
      return
    }
    setSearchLoading(true)
    try {
      const res = await operatorApi.searchItems(q, 1)
      // Filter out the current item from search results
      setSearchResults((res?.data || []).filter(i => i.code !== item.code))
    } catch (err) {
      console.error(err)
    } finally {
      setSearchLoading(false)
    }
  }

  function addComponent(comp) {
    if (compositions.find(c => c.itemCode === comp.code)) return
    setCompositions([...compositions, {
      itemCode: comp.code,
      name: comp.name,
      quantity: 1,
      cost: comp.defaultUnitPrice || 0
    }])
    setSearch('')
    setSearchResults([])
  }

  function removeComponent(code) {
    setCompositions(compositions.filter(c => c.itemCode !== code))
  }

  function updateComp(code, field, value) {
    setCompositions(compositions.map(c => 
      c.itemCode === code ? { ...c, [field]: value } : c
    ))
  }

  async function handleSave() {
    if (compositions.length === 0) {
      setError('Please add at least one component')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload = {
        itemCode: item.code,
        compositions: compositions.map(c => ({
          itemCode: c.itemCode,
          quantity: Number(c.quantity),
          cost: Number(c.cost)
        }))
      }
      await operatorApi.saveItemComposition(payload)
      logActivity({ 
        action: 'SAVE_COMPOSITION', 
        category: 'System', 
        summary: `Saved composition for "${item.name}" (${compositions.length} components)` 
      })
      onSaved()
      onClose()
    } catch (err) {
      setError(err.data?.resultMsg || err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'grid', placeItems: 'center', zIndex: 1000, padding: 20
    }}>
      <div className="modal-card card" onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 600, maxHeight: '90vh', display: 'flex', flexDirection: 'column'
      }}>
        <div className="card__head" style={{ borderBottom: '1px solid var(--ink-200)', padding: '16px 20px' }}>
          <div>
            <h3 style={{ margin: 0 }}>Item Composition</h3>
            <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--ink-500)' }}>
              Manage ingredients/components for <strong>{item.name}</strong>
            </p>
          </div>
          <button className="btn btn--sm" onClick={onClose}>✕</button>
        </div>

        <div className="card__body" style={{ overflowY: 'auto', flex: 1, padding: 20 }}>
          {error && <div className="settings-error" style={{ marginBottom: 16 }}>{error}</div>}

          {/* Search box */}
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Add Component</label>
            <div className="field">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ left: 12 }}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3" strokeLinecap="round"/></svg>
              <input 
                className="form-input" 
                placeholder="Search items by name or code..." 
                value={search}
                onChange={e => handleSearch(e.target.value)}
                style={{ paddingLeft: 38 }}
              />
              {searchLoading && <div style={{ position: 'absolute', right: 12, top: 10, fontSize: 12, color: 'var(--ink-400)' }}>...</div>}
            </div>

            {searchResults.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                background: 'var(--surface)', border: '1px solid var(--ink-200)',
                borderRadius: 8, marginTop: 4, zIndex: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                maxHeight: 200, overflowY: 'auto'
              }}>
                {searchResults.map(res => (
                  <div key={res.id} onClick={() => addComponent(res)} style={{
                    padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--ink-100)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }} className="search-res-item">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{res.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{res.code}</div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{Number(res.defaultUnitPrice || 0).toLocaleString()} RWF</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: 24 }}>
            <label className="form-label">Components List</label>
            {compositions.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--ink-400)', border: '1px dashed var(--ink-200)', borderRadius: 10 }}>
                No components added yet. Use the search box above to add ingredients.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {compositions.map((comp, idx) => (
                  <div key={comp.itemCode} style={{
                    padding: 12, borderRadius: 10, border: '1px solid var(--ink-200)', background: 'var(--ink-50)',
                    display: 'grid', gridTemplateColumns: '1fr 80px 120px 40px', gap: 12, alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{comp.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{comp.itemCode}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: 10, display: 'block', color: 'var(--ink-500)', marginBottom: 2 }}>Qty</label>
                      <input 
                        type="number" className="form-input form-input--sm" 
                        value={comp.quantity} 
                        onChange={e => updateComp(comp.itemCode, 'quantity', e.target.value)}
                        min="0.01" step="0.01"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, display: 'block', color: 'var(--ink-500)', marginBottom: 2 }}>Cost</label>
                      <input 
                        type="number" className="form-input form-input--sm" 
                        value={comp.cost} 
                        onChange={e => updateComp(comp.itemCode, 'cost', e.target.value)}
                      />
                    </div>
                    <button className="btn btn--sm btn--err" style={{ padding: 0, height: 32, width: 32, display: 'grid', placeItems: 'center' }} onClick={() => removeComponent(comp.itemCode)}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--ink-200)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSave} disabled={saving || compositions.length === 0}>
            {saving ? 'Saving...' : 'Save Composition'}
          </button>
        </div>
      </div>

      <style>{`
        .search-res-item:hover { background: var(--ink-50); }
        .modal-overlay { animation: fadeIn 0.2s ease-out; }
        .modal-card { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  )
}
