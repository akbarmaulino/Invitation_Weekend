'use client'
import { useState, useRef, useEffect } from 'react'
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

const labelStyle: React.CSSProperties = {
  fontSize: '0.7em', fontWeight: 700, color: T.muted,
  display: 'block', marginBottom: 5,
  textTransform: 'uppercase', letterSpacing: 0.5,
}

// ── CUSTOM SEARCHABLE SELECT ──────────────────────────────────────────────────
interface SelectOption { label: string; value: string }

interface SearchableSelectProps {
  options: SelectOption[]
  value: string
  onChange: (val: string) => void
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
}

function SearchableSelect({ options, value, onChange, placeholder = 'Pilih...', disabled = false, clearable = true }: SearchableSelectProps) {
  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState('')
  const containerRef          = useRef<HTMLDivElement>(null)
  const inputRef              = useRef<HTMLInputElement>(null)

  const selected = options.find(o => o.value === value) ?? null

  const filtered = query.trim()
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleOpen() {
    if (disabled) return
    setOpen(true)
    setQuery('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleSelect(opt: SelectOption) {
    onChange(opt.value)
    setOpen(false)
    setQuery('')
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange('')
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Control */}
      <div
        onClick={handleOpen}
        style={{
          display: 'flex', alignItems: 'center',
          border: `1.5px solid ${open ? T.navyLight : T.sky}`,
          borderRadius: 10, background: disabled ? T.skyLight : T.white,
          height: 38, cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: open ? `0 0 0 3px ${T.skyMid}66` : 'none',
          transition: 'border-color .15s, box-shadow .15s',
          opacity: disabled ? 0.6 : 1,
          overflow: 'hidden',
        }}
      >
        {open ? (
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onClick={e => e.stopPropagation()}
            placeholder="Cari..."
            style={{
              flex: 1, border: 'none', outline: 'none',
              padding: '0 12px', fontSize: '0.87em',
              color: T.navy, background: 'transparent',
              height: '100%',
            }}
          />
        ) : (
          <span style={{
            flex: 1, padding: '0 12px', fontSize: '0.87em',
            color: selected ? T.navy : T.mutedLight,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {selected ? selected.label : placeholder}
          </span>
        )}

        <div style={{ display: 'flex', alignItems: 'center', paddingRight: 8, gap: 2, flexShrink: 0 }}>
          {clearable && selected && !open && (
            <button
              onClick={handleClear}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.mutedLight, fontSize: '0.75em', padding: '2px 4px', lineHeight: 1, borderRadius: 4 }}
              title="Hapus pilihan"
            >✕</button>
          )}
          <span style={{ color: T.mutedLight, fontSize: '0.65em', transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .15s' }}>▼</span>
        </div>
      </div>

      {/* Dropdown */}
      {open && !disabled && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: T.white, border: `1.5px solid ${T.sky}`,
          borderRadius: 10, boxShadow: '0 8px 24px rgba(3,37,76,0.12)',
          zIndex: 999, maxHeight: 220, overflowY: 'auto',
          padding: 4,
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '10px 12px', fontSize: '0.82em', color: T.mutedLight, textAlign: 'center' }}>
              Tidak ada hasil
            </div>
          ) : (
            filtered.map(opt => (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt)}
                style={{
                  padding: '8px 12px', borderRadius: 6,
                  fontSize: '0.87em', cursor: 'pointer',
                  color: opt.value === value ? T.white : T.navy,
                  background: opt.value === value ? T.navy : 'transparent',
                  transition: 'background .1s',
                }}
                onMouseEnter={e => {
                  if (opt.value !== value) (e.currentTarget as HTMLDivElement).style.background = T.skyLight
                }}
                onMouseLeave={e => {
                  if (opt.value !== value) (e.currentTarget as HTMLDivElement).style.background = 'transparent'
                }}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ── LOCATION ENTRY ────────────────────────────────────────────────────────────
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

// ── PROPS ─────────────────────────────────────────────────────────────────────
interface Props {
  categories: IdeaCategory[]
  cities: City[]
  onClose: () => void
  onSaved: () => void
  onToast: (msg: string, type: any) => void
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
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

  const catOptions: SelectOption[] = [
    ...uniqueCats.map(c => ({ label: c, value: c })),
    { label: '➕ Tambah baru...', value: '__custom__' },
  ]

  const subOptions: SelectOption[] = cat && cat !== '__custom__'
    ? [
        ...subtypesForCat.map(s => ({ label: s.subtype, value: s.type_key })),
        { label: '➕ Tambah baru...', value: '__custom__' },
      ]
    : [{ label: '➕ Tambah baru...', value: '__custom__' }]

  const cityOptions: SelectOption[] = [
    ...cities.map(c => ({ label: c.name, value: c.id })),
  ]

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

      const locPayload = showLoc
        ? locations.filter(l => l.name.trim() || l.address.trim())
        : null

      const firstLoc = locPayload?.[0]

      const { error } = await supabase.from('trip_ideas_v2').insert([{
        idea_name:     finalName,
        type_key:      typeKey,
        day_of_week:   '',
        photo_url:     imageUrl,
        city_id:       city || null,
        locations:     locPayload && locPayload.length > 0 ? locPayload : null,
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
              <label style={labelStyle}>Nama Tempat *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder='misal: Braga Permai' style={inp} />
            </div>

            {/* Kategori */}
            <div>
              <label style={labelStyle}>Kategori *</label>
              <SearchableSelect
                options={catOptions}
                value={cat}
                onChange={val => { setCat(val); setSub(''); setSubCustom('') }}
                placeholder="Pilih kategori..."
              />
              {cat === '__custom__' && (
                <input value={catCustom} onChange={e => setCatCustom(e.target.value)}
                  placeholder='Nama kategori baru' style={{ ...inp, marginTop: 7 }} />
              )}
            </div>

            {/* Sub-tipe */}
            <div>
              <label style={labelStyle}>Sub-tipe *</label>
              <SearchableSelect
                options={subOptions}
                value={sub}
                onChange={val => { setSub(val); setSubCustom('') }}
                placeholder={cat ? 'Pilih sub-tipe...' : 'Pilih kategori dulu'}
                disabled={!cat}
              />
              {sub === '__custom__' && (
                <input value={subCustom} onChange={e => setSubCustom(e.target.value)}
                  placeholder='Nama sub-tipe baru' style={{ ...inp, marginTop: 7 }} />
              )}
            </div>

            {/* Kota */}
            <div>
              <label style={labelStyle}>Kota</label>
              <SearchableSelect
                options={cityOptions}
                value={city}
                onChange={setCity}
                placeholder="Tanpa Kota"
              />
            </div>

            {/* Foto */}
            <div>
              <label style={labelStyle}>Foto (Opsional)</label>
              <input type='file' accept='image/*' onChange={e => setFile(e.target.files?.[0] || null)}
                style={{ fontSize: '0.8em', color: T.navy, width: '100%' }} />
            </div>

            {/* Detail Lokasi Toggle */}
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontWeight: 700, color: T.navy, fontSize: '0.82em' }}>Lokasi {idx + 1}</span>
                        {locations.length > 1 && (
                          <button onClick={() => removeLoc(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8em', fontWeight: 700 }}>✕ Hapus</button>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div>
                          <label style={labelStyle}>Nama Lokasi *</label>
                          <input value={loc.name} onChange={e => updateLoc(idx, 'name', e.target.value)} placeholder='misal: Lokasi Utama' style={inp} />
                        </div>
                        <div>
                          <label style={labelStyle}>Alamat</label>
                          <textarea value={loc.address} onChange={e => updateLoc(idx, 'address', e.target.value)} placeholder='Jl. ...' rows={2} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <div>
                            <label style={labelStyle}>No. Telepon</label>
                            <input value={loc.phone} onChange={e => updateLoc(idx, 'phone', e.target.value)} placeholder='08xx...' style={inp} />
                          </div>
                          <div>
                            <label style={labelStyle}>Jam Buka</label>
                            <input value={loc.opening_hours} onChange={e => updateLoc(idx, 'opening_hours', e.target.value)} placeholder='10:00 - 22:00' style={inp} />
                          </div>
                          <div>
                            <label style={labelStyle}>Kisaran Harga</label>
                            <input value={loc.price_range} onChange={e => updateLoc(idx, 'price_range', e.target.value)} placeholder='25.000 - 200.000' style={inp} />
                          </div>
                          <div>
                            <label style={labelStyle}>Website</label>
                            <input value={loc.website} onChange={e => updateLoc(idx, 'website', e.target.value)} placeholder='https://...' style={inp} />
                          </div>
                        </div>
                        <div>
                          <label style={labelStyle}>Link Google Maps</label>
                          <input value={loc.maps_url} onChange={e => updateLoc(idx, 'maps_url', e.target.value)} placeholder='https://maps.app.goo.gl/...' style={inp} />
                        </div>
                        <div>
                          <label style={labelStyle}>Catatan</label>
                          <textarea value={loc.notes} onChange={e => updateLoc(idx, 'notes', e.target.value)} placeholder='Tips, info tambahan...' rows={2} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addLoc}
                    style={{ padding: '8px 14px', borderRadius: 10, background: T.white, border: `1.5px dashed ${T.skyMid}`, color: T.muted, fontWeight: 600, cursor: 'pointer', fontSize: '0.82em', width: '100%' }}
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