'use client'

const P = '#03254c', S = '#c4e8ff', BGM = '#e1f3ff'

interface Props {
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  danger?: boolean
}

export default function ConfirmDialog({ message, onConfirm, onCancel, confirmLabel = 'Hapus', danger = true }: Props) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(3,37,76,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div style={{ background: 'white', borderRadius: 20, border: `2px solid ${S}`, boxShadow: '0 16px 48px rgba(3,37,76,0.2)', width: '100%', maxWidth: 380, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.8em', flexShrink: 0 }}>{danger ? '🗑️' : '⚠️'}</span>
          <p style={{ margin: 0, fontWeight: 700, color: P, fontSize: '0.95em', lineHeight: 1.5 }}>{message}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{ padding: '9px 22px', borderRadius: 999, background: BGM, color: P, border: `2px solid ${S}`, fontWeight: 700, cursor: 'pointer', fontSize: '0.9em' }}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: '9px 22px', borderRadius: 999, background: danger ? '#f43f5e' : P, color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.9em', boxShadow: danger ? '0 4px 12px rgba(244,63,94,0.3)' : '0 4px 12px rgba(3,37,76,0.2)' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}