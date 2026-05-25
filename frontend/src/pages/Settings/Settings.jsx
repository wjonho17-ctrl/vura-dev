import { useState, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell'
import { configApi } from '../../api/config'
import { authApi } from '../../api/auth'
import { operatorApi } from '../../api/operator'
import { useApp } from '../../context/AppContext'

const PROFILE_FIELDS = [
  { label: 'Full Name',    name: 'fullName',     type: 'text' },
  { label: 'Phone Number', name: 'phoneNumber',  type: 'text' },
  { label: 'Address',      name: 'address',      type: 'text' },
  { label: 'Image URL',    name: 'imageLink',    type: 'text' },
]

const TAX_LABELS = { A: 'Exempt (A)', B: 'Standard VAT (B)', C: 'Zero-rated (C)', D: 'Non-VAT (D)' }
const TAX_DESCS  = {
  A: '0% — Medicines, basic food, financial services',
  B: '18% — Most goods and services',
  C: '0% — Exports, some agricultural inputs',
  D: 'N/A — Non-VAT taxpayers',
}

const EBM_URL  = import.meta.env.VITE_EBM_BASE_URL  || 'http://localhost:8080/vsdc/'
const API_PORT = import.meta.env.VITE_API_PORT       || '8000'

export default function Settings() {
  const { rawUser, refreshUser } = useApp()

  const [initStatus, setInitStatus] = useState('idle') // idle | loading | done | error
  const [initError,  setInitError]  = useState('')

  const [infoRefreshing, setInfoRefreshing] = useState(false)

  const [profileForm,    setProfileForm]    = useState({})
  const [profileSaving,  setProfileSaving]  = useState(false)
  const [profileErr,     setProfileErr]     = useState(null)
  const [profileSaved,   setProfileSaved]   = useState(false)

  const [mrcForm,   setMrcForm]   = useState({ mrc: '', sdcId: '' })
  const [mrcSaving, setMrcSaving] = useState(false)
  const [mrcErr,    setMrcErr]    = useState(null)
  const [mrcSaved,  setMrcSaved]  = useState(false)

  // Seed profile form once rawUser loads
  useEffect(() => {
    if (rawUser && Object.keys(profileForm).length === 0) {
      setProfileForm({
        fullName:    rawUser.fullName    || '',
        phoneNumber: rawUser.phoneNumber || '',
        address:     rawUser.address     || '',
        imageLink:   rawUser.imageLink   || '',
      })
    }
  }, [rawUser])

  async function handleRefreshInfo() {
    setInfoRefreshing(true)
    try { await refreshUser() } catch { /* ignore */ }
    finally { setInfoRefreshing(false) }
  }

  async function handleInit() {
    setInitStatus('loading')
    setInitError('')
    try {
      await authApi.initDevice()
      await refreshUser()
      setInitStatus('done')
    } catch (err) {
      setInitError(err.message || 'Initialization failed.')
      setInitStatus('error')
    }
  }

  async function handleProfileSave(e) {
    e.preventDefault()
    setProfileErr(null); setProfileSaved(false); setProfileSaving(true)
    try {
      const payload = {}
      PROFILE_FIELDS.forEach(({ name }) => {
        if (profileForm[name] !== undefined && profileForm[name] !== '') payload[name] = profileForm[name]
      })
      await authApi.editUser(payload)
      await refreshUser()
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 3000)
    } catch (err) {
      setProfileErr(err.data?.errors?.[0]?.message || err.message)
    } finally { setProfileSaving(false) }
  }

  async function handleMrcSave(e) {
    e.preventDefault()
    setMrcErr(null); setMrcSaved(false); setMrcSaving(true)
    try {
      await authApi.updateMrc({ mrc: mrcForm.mrc, sdcId: mrcForm.sdcId })
      await refreshUser()
      setMrcSaved(true)
      setMrcForm({ mrc: '', sdcId: '' })
      setTimeout(() => setMrcSaved(false), 3000)
    } catch (err) {
      setMrcErr(err.data?.errors?.[0]?.message || err.message)
    } finally { setMrcSaving(false) }
  }

  const [codesId,      setCodesId]      = useState('')
  const [codesData,    setCodesData]    = useState(null)
  const [codesLoading, setCodesLoading] = useState(false)
  const [codesErr,     setCodesErr]     = useState(null)

  async function loadBranchCodes(e) {
    e.preventDefault()
    if (!codesId.trim()) return
    setCodesLoading(true); setCodesErr(null); setCodesData(null)
    try {
      const data = await operatorApi.branchCodes(codesId.trim())
      setCodesData(data)
    } catch (err) {
      setCodesErr(err.message)
    } finally { setCodesLoading(false) }
  }

  const [taxes, setTaxes]       = useState([])
  const [edits, setEdits]       = useState({})
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState({})
  const [saved, setSaved]       = useState({})
  const [error, setError]       = useState(null)

  useEffect(() => {
    configApi.list()
      .then(data => {
        const list = Array.isArray(data) ? data : data?.data ?? []
        setTaxes(list)
        const initial = {}
        list.forEach(t => { initial[t.id] = { rate: t.rate ?? t.taxRate ?? 0 } })
        setEdits(initial)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function saveTax(tax) {
    setSaving(s => ({ ...s, [tax.id]: true }))
    setSaved(s => ({ ...s, [tax.id]: false }))
    try {
      await configApi.update(tax.id, { rate: Number(edits[tax.id]?.rate ?? 0) })
      setSaved(s => ({ ...s, [tax.id]: true }))
      setTimeout(() => setSaved(s => ({ ...s, [tax.id]: false })), 2500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(s => ({ ...s, [tax.id]: false }))
    }
  }

  return (
    <AppShell title="Settings">
      <div className="page">
        <div className="page-head">
          <div>
            <div className="crumbs"><span>Home</span><span>›</span><span>Settings</span></div>
            <h1>Settings</h1>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 20, maxWidth: 860 }}>

          {/* EBM Connection */}
          <div className="card">
            <div className="card__head">
              <h3>EBM Connection</h3>
              <span className="chip chip--ok">Connected</span>
            </div>
            <div className="card__body">
              <table className="settings-table">
                <tbody>
                  <SettingRow label="EBM Base URL"       value={EBM_URL} mono />
                  <SettingRow label="API Server Port"    value={API_PORT} mono />
                  <SettingRow label="EBM API Version"    value="2.1" />
                  <SettingRow label="Specification"      value="VSDC v1.0.5 (RRA EBM 2.1)" />
                </tbody>
              </table>
            </div>
          </div>

          {/* Device Info */}
          {rawUser && (
            <div className="card">
              <div className="card__head">
                <h3>Device Info</h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {rawUser.sdcId
                    ? <span className="chip chip--ok">Initialized</span>
                    : <span className="chip chip--warn">Not Initialized</span>
                  }
                  {rawUser.isTrainingMode && <span className="chip chip--warn">Training Mode</span>}
                  <button className="btn btn--sm" onClick={handleRefreshInfo} disabled={infoRefreshing} style={{ marginLeft: 4 }}>
                    {infoRefreshing ? 'Refreshing…' : 'Refresh'}
                  </button>
                </div>
              </div>
              <div className="card__body">
                <table className="settings-table">
                  <tbody>
                    <SettingRow label="Taxpayer Name" value={rawUser.taxPayerName} />
                    <SettingRow label="TIN"           value={rawUser.tin}            mono />
                    <SettingRow label="Serial No"     value={rawUser.serialNo}       mono />
                    <SettingRow label="SDC ID"        value={rawUser.sdcId || '—'}   mono />
                    <SettingRow label="MRC"           value={rawUser.mrc  || '—'}    mono />
                    <SettingRow label="Branch"        value={rawUser.branchName || rawUser.branchId || '—'} />
                    <SettingRow label="Training Mode" value={rawUser.isTrainingMode ? 'Active' : 'Off'} />
                  </tbody>
                </table>

                {!rawUser.sdcId && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--ink-200)' }}>
                    {initError && (
                      <div style={{ fontSize: 13, color: '#dc2626', marginBottom: 10 }}>{initError}</div>
                    )}
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={handleInit}
                      disabled={initStatus === 'loading'}
                    >
                      {initStatus === 'loading' ? (
                        <>
                          <svg className="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                          </svg>
                          Initializing…
                        </>
                      ) : 'Initialize Device'}
                    </button>
                    <p style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-500)' }}>
                      Registers this device with the RRA EBM server and syncs item classifications.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Edit Profile */}
          {rawUser && (
            <div className="card">
              <div className="card__head">
                <h3>Edit Profile</h3>
              </div>
              <div className="card__body">
                {profileErr && <div className="settings-error" style={{ marginBottom: 14 }}>{profileErr}</div>}
                {profileSaved && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '9px 13px', marginBottom: 14, fontSize: 13, color: '#15803d' }}>
                    ✓ Profile updated successfully
                  </div>
                )}
                <form onSubmit={handleProfileSave}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                    {PROFILE_FIELDS.map(({ label, name, type }) => (
                      <div className="form-group" key={name}>
                        <label className="form-label" htmlFor={`pf-${name}`}>{label}</label>
                        <input
                          id={`pf-${name}`}
                          type={type}
                          className="form-input"
                          value={profileForm[name] ?? ''}
                          onChange={e => setProfileForm(f => ({ ...f, [name]: e.target.value }))}
                          placeholder={name === 'imageLink' ? 'https://…' : ''}
                        />
                      </div>
                    ))}
                  </div>
                  <button type="submit" className="btn btn--primary btn--sm" style={{ marginTop: 4 }} disabled={profileSaving}>
                    {profileSaving ? 'Saving…' : 'Save Profile'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* EBM Credentials */}
          {rawUser && (
            <div className="card">
              <div className="card__head">
                <h3>EBM Credentials</h3>
              </div>
              <div className="card__body">
                <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--ink-500)', lineHeight: 1.5 }}>
                  Update the MRC and SDC ID used to communicate with the RRA EBM server. Only change these if you have received new credentials from the device or sandbox.
                </p>
                {mrcErr && <div className="settings-error" style={{ marginBottom: 14 }}>{mrcErr}</div>}
                {mrcSaved && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '9px 13px', marginBottom: 14, fontSize: 13, color: '#15803d' }}>
                    ✓ EBM credentials updated
                  </div>
                )}
                <form onSubmit={handleMrcSave}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="mrc-mrc">New MRC</label>
                      <input
                        id="mrc-mrc"
                        className="form-input input--mono"
                        placeholder={rawUser.mrc ? `Current: ${rawUser.mrc}` : 'New MRC value'}
                        value={mrcForm.mrc}
                        onChange={e => setMrcForm(f => ({ ...f, mrc: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="mrc-sdcid">New SDC ID</label>
                      <input
                        id="mrc-sdcid"
                        className="form-input input--mono"
                        placeholder={rawUser.sdcId ? `Current: ${rawUser.sdcId}` : 'New SDC ID'}
                        value={mrcForm.sdcId}
                        onChange={e => setMrcForm(f => ({ ...f, sdcId: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn--primary btn--sm" style={{ marginTop: 4 }} disabled={mrcSaving}>
                    {mrcSaving ? 'Updating…' : 'Update Credentials'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Branch Reference Data */}
          <div className="card">
            <div className="card__head">
              <h3>Branch Reference Data</h3>
            </div>
            <div className="card__body">
              <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--ink-500)', lineHeight: 1.5 }}>
                Load tax types, item classifications, and payment types registered for a branch from the EBM server.
              </p>
              <form onSubmit={loadBranchCodes} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 14 }}>
                <div className="form-group" style={{ margin: 0, flex: '0 0 180px' }}>
                  <label className="form-label" htmlFor="codes-branch">Branch ID</label>
                  <input
                    id="codes-branch"
                    className="form-input form-input--sm input--mono"
                    placeholder={rawUser?.branchId || '00'}
                    value={codesId}
                    onChange={e => setCodesId(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn--primary btn--sm" disabled={codesLoading}>
                  {codesLoading ? 'Loading…' : 'Load Codes'}
                </button>
              </form>
              {codesErr && <div className="settings-error" style={{ marginBottom: 12 }}>{codesErr}</div>}
              {codesData && (
                <div style={{ display: 'grid', gap: 12 }}>
                  {Object.entries(codesData).map(([key, val]) => {
                    const items = Array.isArray(val) ? val : null
                    return (
                      <div key={key}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-400)', marginBottom: 6 }}>
                          {key} {items && <span style={{ color: 'var(--ink-300)', fontWeight: 400 }}>({items.length})</span>}
                        </div>
                        {items ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {items.slice(0, 20).map((item, i) => (
                              <span key={i} className="chip chip--plain" style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                                {item.cd || item.code || item.id || JSON.stringify(item)}
                                {(item.name || item.cdNm) && <span style={{ color: 'var(--ink-500)', marginLeft: 4 }}>{item.name || item.cdNm}</span>}
                              </span>
                            ))}
                            {items.length > 20 && <span className="chip chip--plain" style={{ fontSize: 11 }}>+{items.length - 20} more</span>}
                          </div>
                        ) : (
                          <code style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ink-600)' }}>{JSON.stringify(val)}</code>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Tax Configuration */}
          <div className="card">
            <div className="card__head">
              <h3>Tax Configuration</h3>
              <span className="chip chip--info chip--plain" style={{ fontSize: 12 }}>Requires API access</span>
            </div>
            <div className="card__body">
              {error && (
                <div className="settings-error">{error}</div>
              )}
              {loading ? (
                <div style={{ color: 'var(--ink-500)', padding: '12px 0' }}>Loading tax rates…</div>
              ) : taxes.length === 0 ? (
                <div style={{ color: 'var(--ink-500)', padding: '12px 0' }}>
                  No tax configuration found. Rates are read from environment variables.
                </div>
              ) : (
                <table className="data" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Description</th>
                      <th className="num">Rate (%)</th>
                      <th style={{ width: 100 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxes.map(tax => {
                      const key  = tax.taxType || tax.type || tax.cd
                      const edit = edits[tax.id] ?? { rate: tax.rate ?? 0 }
                      return (
                        <tr key={tax.id}>
                          <td>
                            <span className="chip chip--brand chip--plain">{key}</span>
                          </td>
                          <td style={{ color: 'var(--ink-600)' }}>
                            {TAX_DESCS[key] || tax.name || '—'}
                          </td>
                          <td className="num">
                            <input
                              type="number"
                              className="form-input form-input--sm form-input--num"
                              value={edit.rate}
                              min={0} max={100} step={0.01}
                              onChange={e => setEdits(prev => ({ ...prev, [tax.id]: { rate: e.target.value } }))}
                            />
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className={`btn btn--sm${saved[tax.id] ? ' btn--ok' : ''}`}
                              style={saved[tax.id] ? { color: 'var(--ok)', borderColor: '#bbf7d0' } : {}}
                              onClick={() => saveTax(tax)}
                              disabled={saving[tax.id]}
                            >
                              {saving[tax.id] ? 'Saving…' : saved[tax.id] ? '✓ Saved' : 'Save'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}

              {/* Static fallback when no DB config */}
              {!loading && taxes.length === 0 && (
                <table className="data" style={{ width: '100%', marginTop: 12 }}>
                  <thead>
                    <tr><th>Type</th><th>Description</th><th className="num">Rate (%)</th></tr>
                  </thead>
                  <tbody>
                    {['A','B','C','D'].map(k => (
                      <tr key={k}>
                        <td><span className="chip chip--brand chip--plain">{k}</span></td>
                        <td style={{ color: 'var(--ink-600)' }}>{TAX_DESCS[k]}</td>
                        <td className="num mono">{k === 'B' ? '18.00' : '0.00'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  )
}

function SettingRow({ label, value, mono }) {
  return (
    <tr>
      <td style={{ padding: '8px 0', color: 'var(--ink-500)', fontSize: 13, width: 180, verticalAlign: 'top' }}>{label}</td>
      <td style={{ padding: '8px 0 8px 16px', fontWeight: 500 }}>
        {mono
          ? <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, background: 'var(--ink-100)', padding: '2px 6px', borderRadius: 5 }}>{value || '—'}</code>
          : <span>{value || '—'}</span>
        }
      </td>
    </tr>
  )
}
