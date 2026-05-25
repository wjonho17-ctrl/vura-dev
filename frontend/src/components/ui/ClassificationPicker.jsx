/**
 * ClassificationPicker — searchable dropdown for EBM item classification codes.
 * Loads from GET /codes/item/classification/list with debounced search.
 *
 * Props:
 *   value      {string}   — current classification code value
 *   onChange   {fn}       — called with (code) when user selects
 *   required   {boolean}
 *   id         {string}
 */
import { useState, useEffect, useRef } from 'react'
import { operatorApi } from '../../api/operator'

export default function ClassificationPicker({ value, onChange, onSelect, required, id = 'classCode' }) {
  const [query,   setQuery]   = useState(value || '')
  const [results, setResults] = useState([])
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)
  const timer = useRef(null)
  const wrapRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handler(e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Debounced search
  useEffect(() => {
    clearTimeout(timer.current)
    if (!query || query.length < 2) { setResults([]); return }
    timer.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await operatorApi.searchClassificationCodes(query)
        const data = res?.data ?? res ?? []
        setResults(Array.isArray(data) ? data.slice(0, 20) : [])
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(timer.current)
  }, [query])

  function select(obj) {
    const code = obj.code || obj.itemClsCd || ''
    setQuery(code)
    onChange(code)
    if (onSelect) onSelect(obj)
    setOpen(false)
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        id={id}
        className="form-input"
        required={required}
        placeholder="Type to search (e.g. 5020230101 or Milk)"
        value={query}
        autoComplete="off"
        onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true) }}
        onFocus={() => query.length >= 2 && setOpen(true)}
      />
      {open && (query.length >= 2) && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 300,
          background: 'var(--surface)', border: '1px solid var(--ink-200)', borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,.10)', maxHeight: 240, overflowY: 'auto',
        }}>
          {loading && (
            <div style={{ padding: '10px 14px', fontSize: 12.5, color: 'var(--ink-500)' }}>Searching…</div>
          )}
          {!loading && results.length === 0 && (
            <div style={{ padding: '10px 14px', fontSize: 12.5, color: 'var(--ink-500)' }}>No results — type the code directly</div>
          )}
          {results.map((c, i) => (
            <button
              key={c.code || c.itemClsCd || i}
              type="button"
              onClick={() => select(c)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '9px 14px', border: 'none', background: 'none',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                borderTop: i > 0 ? '1px solid var(--ink-100)' : 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--ink-50)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--brand-700)', minWidth: 100 }}>
                {c.code || c.itemClsCd}
              </span>
              <span style={{ fontSize: 13, color: 'var(--ink-800)' }}>
                {c.name || c.itemClsNm}
              </span>
              {(c.taxType || c.taxTyCd) && (
                <span className={`tax-chip tax-${c.taxType || c.taxTyCd}`} style={{ marginLeft: 'auto' }}>
                  {c.taxType || c.taxTyCd}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
