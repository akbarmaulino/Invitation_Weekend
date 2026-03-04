'use client'
import { c } from '@/lib/theme'
import type { LocalSelection } from '@/types/types'

interface Props {
  selections: LocalSelection[]
  onRemove: (id: string) => void
  onClearAll: () => void
  onLocate: (id: string) => void
}

export default function SelectedPanel({ selections, onRemove, onClearAll, onLocate }: Props) {
  if (selections.length === 0) return null
  return (
    <div style={{ padding: 20, borderRadius: 20, background: 'linear-gradient(135deg, #e1f3ff, #c4e8ff)', border: '2px solid #c4e8ff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontWeight: 800, color: '#03254c', fontSize: '0.95em' }}>
          💜 {selections.length} aktivitas terpilih
        </span>
        <button onClick={onClearAll} style={{ background: 'none', border: 'none', color: '#1a7aa8', fontSize: '0.82em', fontWeight: 700, cursor: 'pointer' }}>
          Hapus semua
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {selections.map(s => (
          <div key={s.ideaId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 12, background: 'white', border: '1.5px solid #c4e8ff' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88em', color: '#03254c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</p>
              <p style={{ margin: 0, fontSize: '0.75em', color: '#9ca3af' }}>{s.subtype}</p>
            </div>
            <button onClick={() => onLocate(s.ideaId)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1em' }} title="Cari di list">📍</button>
            <button onClick={() => onRemove(s.ideaId)} style={{ background: '#fff1f2', border: 'none', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#f43f5e', fontWeight: 800, fontSize: '0.85em' }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}