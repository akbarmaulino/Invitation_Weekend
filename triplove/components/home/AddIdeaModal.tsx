'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadImage } from '@/lib/utils'
import type { IdeaCategory, City } from '@/types/types'

const T = {
  navy: '#03254c', navyMid: '#1a4d7a', navyLight: '#2563a8',
  sky: '#c4e8ff', skyLight: '#e1f3ff', skyMid: '#a8d8f0',
  white: '#ffffff', muted: '#6b8cae', mutedLight: '#a0bcd4',
}

const inp: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  border: `1.5px solid ${T.sky}`, borderRadius: 10,
  fontSize: '0.87em', color: T.navy, background: T.white,
  outline: 'none', boxSizing: 'border-box',
}

const label: React.CSSProperties = {
  fontSize: '0.7em', fontWeight: 700, color: T.muted,
  display: 'block', marginBottom: 5,
  textTransform: 'uppercase', letterSpacing: 0.5,
}

interface LocationEntry {
  name: string
  address: string
  phone: string
  opening_hours: string
  price_range: string
  website: string
  maps_url: string
  notes: string
}

const emptyLocation = (): LocationEntry => ({
  name: '', address: '', phone: '',
  opening_hours: '', price_range: '',
  website: '', maps_url: '', notes: '',
})

interface Props {
  categories: IdeaCategory[]
  cities: City[]
  onClose: () => void
  onSaved: () => void
  onToast: (msg: string, type: any) => void
}

export default function AddIdeaModal({ categories, cities, onClose, onSaved, onToast }: Props) {
  const [name, setName]           = useState('')
  const [cat, setCat]             = useState('')
  const [catCustom, setCatCustom] = useState('')
  const [sub, setSub]             = useState('')
  const [subCustom, setSubCustom] = useState('')
  const [city, setCity]           = useState('')
  const [file, setFile]           = useState<File | null>(null)
  const [saving, setSaving]       = useState(false)
  const [showLoc, setShowLoc]     = useState(false)
  const [locations, setLocations] = useState<LocationEntry[]>([emptyLocation()])

  const uniqueCats     = [...new Set(categories.map(c => c.category))]
  const subtypesForCat = categories.filter(c => c.category === cat)

  const updateLoc = (idx: number, field: keyof LocationEntry, val: string) => {
    setLocations(prev => prev.map((l, i) => i === idx ? { ...l, [field]: val } : l))
  }

  const addLoc    = () => setLocations(prev => [...prev, emptyLocation()])
  const removeLoc = (idx: number) => setLocations(prev => prev.filter((_, i) => i !== idx))

  const handleSave = async () => {
    const finalName = name.trim()
    const finalCat  = cat === '__custom__' ? catCustom.trim() : cat
    const finalSub  = sub === '__custom__' ? subCustom.trim() : sub
    if (!finalName) return onToast('Nama tidak boleh kosong!', 'warn')
    if (!finalCat)  return onToast('Pilih atau isi kategori!', 'warn')
    if (!finalSub)  return onToast('Pilih atau isi sub-tipe!', 'warn')

    setSaving(true)
    try {
      let imageUrl: string | null = null
      if (file) imageUrl = await uploadImage(file, 'anon')

      if (cat === '__custom__' || sub === '__custom__') {
        const tk = finalSub.toLowerCase().replace(/\s+/g, '_')
        await supabase.from('idea_categories').upsert(
          [{ category: finalCat, subtype: finalSub, type_key: tk, icon: '📍', photo_url: null }],
          { onConflict: 'type_key' }
        )
      }

      const typeKey = sub === '__custom__'
        ? finalSub.toLowerCase().replace(/\s+/g, '_')
        : sub

      // Build locations array — only include if user toggled location section
      const locPayload = showLoc
        ? locations.filter(l => l.name.trim() || l.address.trim())
        : null

      // Use first location's fields as top-level columns too (for backward compat)
      const firstLoc = locPayload?.[0]

      const { error } = await supabase.from('trip_ideas_v2').insert([{
        idea_name:     finalName,
        type_key:      typeKey,
        day_of_week:   '',
        photo_url:     imageUrl,
        city_id:       city || null,
        locations:     locPayload && locPayload.length > 0 ? locPayload : null,
        // top-level columns from first location
        address:       firstLoc?.address || null,
        maps_url:      firstLoc?.maps_url || null,
        phone:         firstLoc?.phone || null,
        opening_hours: firstLoc?.opening_hours || null,
        price_range:   firstLoc?.price_range || null,
        website:       firstLoc?.website || null,
        notes:         firstLoc?.notes || null,
      }])

      if (error) throw error
      onSaved()
      onToast('Ide berhasil ditambahkan! 🎉', 'success')
    } catch {
      onToast('Gagal menyimpan. Coba lagi.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(3,37,76,0.38)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: T.white, borderRadius: 20, border: `1.5px solid ${T.sky}`, boxShadow: '0 20px 60px rgba(3,37,76,.2)', width: '100%', maxWidth: 480, margin: 'auto' }}>
        <div style={{ padding: '20px 22px 24px' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ color: T.navy, fontWeight: 800, margin: 0, fontSize: '1.02em' }}>➕ Tambah Ide Baru</h3>
            <button onClick={onClose} style={{ background: T.skyLight, border: `1px solid ${T.sky}`, borderRadius: 999, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.navy, fontWeight: 700, fontSize: '0.8em' }}>✕</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>

            {/* Nama */}
            <div>
              <label style={label}>Nama Tempat *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder='misal: Braga Permai' style={inp} />
            </div>

            {/* Kategori */}
            <div>
              <label style={label}>Kategori *</label>
              <select value={cat} onChange={e => { setCat(e.target.value); setSub('') }} style={inp}>
                <option value=''>Pilih...</option>
                {uniqueCats.map(c => <option key={c} value={c}>{c}</option>)}
                <option value='__custom__'>➕ Tambah baru...</option>
              </select>
              {cat === '__custom__' && (
                <input value={catCustom} onChange={e => setCatCustom(e.target.value)} placeholder='Nama kategori baru' style={{ ...inp, marginTop: 7 }} />
              )}
            </div>

            {/* Sub-tipe */}
            <div>
              <label style={label}>Sub-tipe *</label>
              <select value={sub} onChange={e => setSub(e.target.value)} disabled={!cat} style={{ ...inp, opacity: !cat ? 0.5 : 1 }}>
                <option value=''>Pilih...</option>
                {cat !== '__custom__' && subtypesForCat.map(s => <option key={s.type_key} value={s.type_key}>{s.subtype}</option>)}
                <option value='__custom__'>➕ Tambah baru...</option>
              </select>
              {sub === '__custom__' && (
                <input value={subCustom} onChange={e => setSubCustom(e.target.value)} placeholder='Nama sub-tipe baru' style={{ ...inp, marginTop: 7 }} />
              )}
            </div>

            {/* Kota */}
            <div>
              <label style={label}>Kota</label>
              <select value={city} onChange={e => setCity(e.target.value)} style={inp}>
                <option value=''>Tanpa Kota</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Foto */}
            <div>
              <label style={label}>Foto (Opsional)</label>
              <input type='file' accept='image/*' onChange={e => setFile(e.target.files?.[0] || null)} style={{ fontSize: '0.8em', color: T.navy, width: '100%' }} />
            </div>

            {/* ─── Detail Lokasi Toggle ─── */}
            <div style={{ borderTop: `1.5px dashed ${T.sky}`, paddingTop: 12, marginTop: 2 }}>
              <button
                onClick={() => setShowLoc(v => !v)}
                style={{
                  width: '100%', padding: '9px 14px', borderRadius: 10,
                  background: showLoc ? T.skyLight : T.white,
                  border: `1.5px solid ${T.sky}`,
                  color: T.navy, fontWeight: 700, cursor: 'pointer',
                  fontSize: '0.84em', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <span>📍 Detail Lokasi (Opsional)</span>
                <span style={{ fontSize: '0.75em', color: T.muted }}>{showLoc ? '▲ Sembunyikan' : '▼ Tampilkan'}</span>
              </button>

              {showLoc && (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {locations.map((loc, idx) => (
                    <div key={idx} style={{ background: T.skyLight, borderRadius: 12, border: `1.5px solid ${T.sky}`, padding: '14px 14px 10px' }}>

                      {/* Location header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontWeight: 700, color: T.navy, fontSize: '0.82em' }}>Lokasi {idx + 1}</span>
                        {locations.length > 1 && (
                          <button onClick={() => removeLoc(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8em', fontWeight: 700 }}>✕ Hapus</button>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div>
                          <label style={label}>Nama Lokasi *</label>
                          <input value={loc.name} onChange={e => updateLoc(idx, 'name', e.target.value)} placeholder='misal: Lokasi Utama' style={inp} />
                        </div>
                        <div>
                          <label style={label}>Alamat</label>
                          <textarea value={loc.address} onChange={e => updateLoc(idx, 'address', e.target.value)} placeholder='Jl. ...' rows={2}
                            style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <div>
                            <label style={label}>No. Telepon</label>
                            <input value={loc.phone} onChange={e => updateLoc(idx, 'phone', e.target.value)} placeholder='08xx...' style={inp} />
                          </div>
                          <div>
                            <label style={label}>Jam Buka</label>
                            <input value={loc.opening_hours} onChange={e => updateLoc(idx, 'opening_hours', e.target.value)} placeholder='10:00 - 22:00' style={inp} />
                          </div>
                          <div>
                            <label style={label}>Kisaran Harga</label>
                            <input value={loc.price_range} onChange={e => updateLoc(idx, 'price_range', e.target.value)} placeholder='25.000 - 200.000' style={inp} />
                          </div>
                          <div>
                            <label style={label}>Website</label>
                            <input value={loc.website} onChange={e => updateLoc(idx, 'website', e.target.value)} placeholder='https://...' style={inp} />
                          </div>
                        </div>
                        <div>
                          <label style={label}>Link Google Maps</label>
                          <input value={loc.maps_url} onChange={e => updateLoc(idx, 'maps_url', e.target.value)} placeholder='https://maps.app.goo.gl/...' style={inp} />
                        </div>
                        <div>
                          <label style={label}>Catatan</label>
                          <textarea value={loc.notes} onChange={e => updateLoc(idx, 'notes', e.target.value)} placeholder='Tips, info tambahan...' rows={2}
                            style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }} />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add location button */}
                  <button
                    onClick={addLoc}
                    style={{
                      padding: '8px 14px', borderRadius: 10,
                      background: T.white, border: `1.5px dashed ${T.skyMid}`,
                      color: T.muted, fontWeight: 600, cursor: 'pointer',
                      fontSize: '0.82em', width: '100%',
                    }}
                  >➕ Tambah Lokasi Lain</button>
                </div>
              )}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%', marginTop: 16, padding: '12px', borderRadius: 11,
              background: saving ? T.sky : `linear-gradient(135deg, ${T.navy}, ${T.navyMid})`,
              color: saving ? T.muted : T.white,
              border: 'none', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '0.9em', boxShadow: saving ? 'none' : '0 4px 14px rgba(3,37,76,.2)',
              transition: 'all .15s',
            }}
          >{saving ? '⏳ Menyimpan...' : '💾 Simpan Ide'}</button>
        </div>
      </div>
    </div>
  )
}