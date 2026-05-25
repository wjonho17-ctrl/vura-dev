import { useState } from 'react'

const TAX_LABEL = { A: 'A Exempt', B: 'B 18%', C: 'C Zero', D: 'D Non-VAT' }
const TAX_COLORS = { A: 'tax-A', B: 'tax-B', C: 'tax-C', D: 'tax-D' }
const TYPE_CODES = [
  { v: '1', l: 'Raw Material' },
  { v: '2', l: 'Finished Product' },
  { v: '3', l: 'Service (no stock check)' },
]

const AVATAR_COLORS = [
  { bg: 'var(--brand-100)', color: 'var(--brand-700)' },
  { bg: '#dcfce7', color: 'var(--ok)' },
  { bg: '#fef3c7', color: '#b45309' },
  { bg: '#ede9fe', color: '#6d28d9' },
  { bg: '#cffafe', color: '#0e7490' },
  { bg: '#ffe4e6', color: '#be123c' },
]

function avatarColor(str) {
  let h = 0
  for (let i = 0; i < (str || '').length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffff
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

export default function ItemDetailView({
  item,
  editItem,
  editPrice,
  editSaving,
  setEditPrice,
  onOpenEditPrice,
  onSavePrice,
  onCancelEdit,
  onToggleActive,
  onComposition,
  onDelete,
  typeLabel,
}) {
  if (!item) return null

  const { bg, color } = avatarColor(item.code || '??')
  const initials = (item.name || item.code || '??').slice(0, 2).toUpperCase()
  const isEditing = editItem?.id === item.id
  const isActive = item.useYn === 'Y'

  return (
    <div style={{ padding: '20px' }}>
      {/* Header with back button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, flex: 1, fontSize: '18px', fontWeight: 600 }}>Item Details</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn--sm btn--ghost"
            onClick={onToggleActive}
            title={isActive ? 'Deactivate item' : 'Activate item'}
          >
            {isActive ? '✓ Active' : '○ Inactive'}
          </button>
          <button
            className="btn btn--sm btn--ghost"
            onClick={onComposition}
            title="View/edit composition"
          >
            ◆ Composition
          </button>
          <button
            className="btn btn--sm btn--ghost"
            onClick={onDelete}
            title="Delete item"
            style={{ color: 'var(--err)' }}
          >
            🗑 Delete
          </button>
        </div>
      </div>

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left column - Basic info */}
        <div>
          {/* Item card */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--ink-200)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  background: bg,
                  color: color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '16px',
                }}
              >
                {initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{item.name}</div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--ink-500)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {item.code}
                </div>
                {item.barcode && (
                  <div
                    style={{
                      fontSize: '10px',
                      color: 'var(--ink-500)',
                      fontFamily: 'var(--font-mono)',
                      marginTop: '2px',
                    }}
                  >
                    BCD {item.barcode}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Basic information */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--ink-200)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--ink-100)', background: 'var(--ink-50)' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-700)' }}>Basic Information</div>
            </div>
            <div style={{ padding: '16px' }}>
              <DetailRow label="Item Type" value={typeLabel || item.typeCode} />
              <DetailRow label="Classification" value={item.classificationCode || '—'} />
              <DetailRow label="Tax Type" value={TAX_LABEL[item.taxTypeCode] || item.taxTypeCode} />
              <DetailRow label="Status" value={isActive ? 'Active' : 'Inactive'} />
              <DetailRow label="Insurance Applicable" value={item.insuranceApplicableYn === 'Y' ? 'Yes' : 'No'} />
              <DetailRow
                label="CIS Product ID"
                value={item.cisProductId || '—'}
                mono
              />
              {item.batchNo && <DetailRow label="Batch No" value={item.batchNo} mono />}
            </div>
          </div>
        </div>

        {/* Right column - Detailed specs */}
        <div>
          {/* Pricing section */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--ink-200)',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '16px',
            }}
          >
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--ink-100)', background: 'var(--ink-50)' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-700)' }}>Pricing</div>
            </div>
            <div style={{ padding: '16px' }}>
              {isEditing ? (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>
                    Unit Price (RWF)
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '1px solid var(--ink-200)',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                      }}
                      placeholder="0"
                    />
                    <button
                      className="btn btn--sm"
                      onClick={onSavePrice}
                      disabled={editSaving}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {editSaving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      className="btn btn--sm btn--ghost"
                      onClick={onCancelEdit}
                      disabled={editSaving}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <DetailRow
                    label="Default Unit Price"
                    value={`${Number(item.defaultUnitPrice || 0).toLocaleString()} RWF`}
                    action={() => onOpenEditPrice()}
                    actionLabel="Edit"
                  />
                </>
              )}
              {item.groupPriceOne && (
                <DetailRow label="Group Price 1" value={`${Number(item.groupPriceOne).toLocaleString()} RWF`} />
              )}
              {item.groupPriceTwo && (
                <DetailRow label="Group Price 2" value={`${Number(item.groupPriceTwo).toLocaleString()} RWF`} />
              )}
              {item.groupPriceThree && (
                <DetailRow label="Group Price 3" value={`${Number(item.groupPriceThree).toLocaleString()} RWF`} />
              )}
              {item.groupPriceFour && (
                <DetailRow label="Group Price 4" value={`${Number(item.groupPriceFour).toLocaleString()} RWF`} />
              )}
              {item.groupPriceFive && (
                <DetailRow label="Group Price 5" value={`${Number(item.groupPriceFive).toLocaleString()} RWF`} />
              )}
              {item.saftyQuantity && (
                <DetailRow label="Safety Quantity" value={Number(item.saftyQuantity).toLocaleString()} />
              )}
            </div>
          </div>

          {/* Specifications section */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--ink-200)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--ink-100)', background: 'var(--ink-50)' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-700)' }}>Specifications</div>
            </div>
            <div style={{ padding: '16px' }}>
              <DetailRow label="Quantity Unit" value={item.quantityUnitCode || '—'} />
              <DetailRow label="Packaging Unit" value={item.packagingUnitCode || '—'} />
              <DetailRow label="Origin Country" value={item.originalNationCode || '—'} />
              {item.code?.countryCode && (
                <DetailRow label="Country Code" value={item.code.countryCode} />
              )}
              {item.code?.productType && (
                <DetailRow label="Product Type" value={item.code.productType} />
              )}
              {item.code?.packingUnit && (
                <DetailRow label="Packing Unit" value={item.code.packingUnit} />
              )}
              {item.code?.quantityUnit && (
                <DetailRow label="Quantity Unit (Code)" value={item.code.quantityUnit} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value, action, actionLabel, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
      <div style={{ fontSize: '12px', color: 'var(--ink-600)' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 500,
            fontFamily: mono ? 'var(--font-mono)' : 'inherit',
            color: 'var(--ink-900)',
            textAlign: 'right',
          }}
        >
          {value}
        </div>
        {action && (
          <button
            className="btn btn--xs btn--ghost"
            onClick={action}
            style={{ fontSize: '11px', padding: '4px 8px' }}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
