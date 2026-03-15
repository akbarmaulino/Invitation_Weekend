'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { TripIdea, IdeaLocation } from '@/types/types'

const P = '#03254c', PL = '#e1f3ff', PB = '#c4e8ff', MUTED = '#9ca3af'
const inp: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  border: '2px solid #c4e8ff', borderRadius: 12,
  fontSize: '0.93em', color: P,
  background: 'white', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
}

interface Props {
  idea: TripIdea
  onClose: () => void
  onSaved: () => void
}

function emptyLoc(): IdeaLocation {
  return { name: '', address: null, maps_url: null, phone: null, opening_hours: null, price_range: null, website: null, notes: null }
}

export default function EditLocationModal({ idea, onClose, onSaved }: Props) {
  const initLocs = (): IdeaLocation[] => {
    if (idea.locations?.length) return idea.locations.map(l => ({ ...l }))
    if (idea.address || idea.maps_url) return [{
      name: 'Lokasi Utama',
      address: idea.address || null,
      maps_url: idea.maps_url || null,
      phone: idea.phone || null,
      opening_hours: idea.opening_hours || null,
      price_range: idea.price_range || null,
      website: idea.website || null,
      notes: idea.notes || null,
    }]
    return [emptyLoc()]
  }

  const [locs, setLocs] = useState<IdeaLocation[]>(initLocs)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')

  function updateLoc(i: number, key: keyof IdeaLocation, val: string) {
    setLocs(prev => prev.map((l, idx) => idx === i ? { ...l, [key]: val || null } : l))
  }

  function addLoc() {
    setLocs(prev => [...prev, emptyLoc()])
  }

  function removeLoc(i: number) {
    setLocs(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSave() {
    const valid = locs.filter(l => l.name?.trim())
    if (valid.length === 0) { setStatus('⚠️ Minimal isi nama lokasi!'); return }
    setSaving(true)
    setStatus('⏳ Menyimpan...')
    const { error } = await supabase
      .from('trip_ideas_v2')
      .update({ locations: valid })
      .eq('id', idea.id)
    if (error) { setStatus('❌ Gagal: ' + error.message); setSaving(false); return }
    setStatus('✅ Tersimpan!')
    setSaving(false)
    setTimeout(() => { onSaved(); onClose() }, 600)
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(3,37,76,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'white', borderRadius: '24px 24px 0 0',
        border: '2px solid #c4e8ff', borderBottom: 'none',
        width: '100%', maxWidth: 600,
        maxHeight: '90vh', overflowY: 'auto',
        padding: '24px 24px 40px',
        boxShadow: '0 -8px 40px rgba(3,37,76,0.2)',
      }}>
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 99, background: '#a8d8f0', margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontWeight: 800, color: P, margin: '0 0 2px', fontSize: '1.05em' }}>📍 Kelola Lokasi</h3>
            <p style={{ margin: 0, fontSize: '0.78em', color: MUTED }}>{idea.idea_name}</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: PL, border: '1.5px solid #a8d8f0', borderRadius: 999, padding: '4px 12px', fontWeight: 700, cursor: 'pointer', color: P, fontFamily: 'inherit' }}
          >✕ Tutup</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {locs.map((loc, i) => (
            <div key={i} style={{ borderRadius: 16, border: '1.5px solid #c4e8ff', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ padding: '10px 14px', background: PL, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: P, fontSize: '0.88em' }}>Lokasi {i + 1}</span>
                {locs.length > 1 && (
                  <button
                    onClick={() => removeLoc(i)}
                    style={{ background: '#fff1f2', border: '1px solid #fda4af', borderRadius: 999, padding: '2px 10px', color: '#f43f5e', fontWeight: 700, cursor: 'pointer', fontSize: '0.78em', fontFamily: 'inherit' }}
                  >🗑️ Hapus</button>
                )}
              </div>

              {/* Fields */}
              <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.72em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 4 }}>Nama Lokasi *</label>
                  <input value={loc.name || ''} onChange={e => updateLoc(i, 'name', e.target.value)} placeholder='misal: Outlet Utama' style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: '0.72em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 4 }}>Alamat</label>
                  <textarea value={loc.address || ''} onChange={e => updateLoc(i, 'address', e.target.value)} placeholder='Alamat lengkap...' rows={2} style={{ ...inp, resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: '0.72em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 4 }}>No. Telepon</label>
                    <input value={loc.phone || ''} onChange={e => updateLoc(i, 'phone', e.target.value)} placeholder='08xx...' style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 4 }}>Jam Buka</label>
                    <input value={loc.opening_hours || ''} onChange={e => updateLoc(i, 'opening_hours', e.target.value)} placeholder='10:00 - 22:00' style={inp} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: '0.72em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 4 }}>Kisaran Harga</label>
                    <input value={loc.price_range || ''} onChange={e => updateLoc(i, 'price_range', e.target.value)} placeholder='Rp 50.000 - 100.000' style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 4 }}>Website</label>
                    <input value={loc.website || ''} onChange={e => updateLoc(i, 'website', e.target.value)} placeholder='https://...' style={inp} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.72em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 4 }}>Link Google Maps</label>
                  <input value={loc.maps_url || ''} onChange={e => updateLoc(i, 'maps_url', e.target.value)} placeholder='https://maps.google.com/...' style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: '0.72em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 4 }}>Catatan</label>
                  <textarea value={loc.notes || ''} onChange={e => updateLoc(i, 'notes', e.target.value)} placeholder='Tips, info tambahan...' rows={2} style={{ ...inp, resize: 'vertical' }} />
                </div>
              </div>
            </div>
          ))}

          {/* Add location button */}
          <button
            onClick={addLoc}
            style={{
              padding: '10px', borderRadius: 12,
              background: PL, border: '1.5px dashed #a8d8f0',
              color: P, fontWeight: 700, cursor: 'pointer',
              fontSize: '0.85em', fontFamily: 'inherit',
            }}
          >➕ Tambah Lokasi Lain</button>

          {status && (
            <p style={{ margin: 0, fontSize: '0.85em', fontWeight: 600, color: status.startsWith('❌') ? '#f43f5e' : status.startsWith('⚠️') ? '#f59e0b' : P }}>
              {status}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '13px', borderRadius: 14,
              background: saving ? '#a8d8f0' : 'linear-gradient(135deg, #03254c, #1a4d7a)',
              color: 'white', border: 'none',
              fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '0.95em', fontFamily: 'inherit',
              boxShadow: saving ? 'none' : '0 4px 14px rgba(3,37,76,0.3)',
            }}
          >{saving ? '⏳ Menyimpan...' : '💾 Simpan Semua'}</button>
        </div>
      </div>
    </div>
  )
}