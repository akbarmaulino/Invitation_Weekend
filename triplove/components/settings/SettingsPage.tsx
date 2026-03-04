'use client'

import { useState, useEffect, useMemo } from 'react'
import Navbar from '@/components/ui/Navbar'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { getPublicImageUrl } from '@/lib/utils'
import Toast from '@/components/ui/Toast'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import type { City, IdeaCategory, TripIdea } from '@/types/types'

const P = '#03254c', S = '#c4e8ff', BG = '#d0efff', BGM = '#e1f3ff', MUTED = '#a0a0b5'
const inp: React.CSSProperties = { width: '100%', padding: '9px 13px', border: `2px solid ${S}`, borderRadius: 10, fontSize: '0.9em', color: P, background: 'white', outline: 'none', boxSizing: 'border-box' }
const card: React.CSSProperties = { background: 'white', borderRadius: 20, border: `2px solid ${S}`, boxShadow: '0 4px 12px rgba(3,37,76,0.08)', padding: 24 }

type Tab = 'cities' | 'categories' | 'places'

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('cities')

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${BG}, ${BGM})` }}>
      <Navbar />

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontWeight: 900, fontSize: '1.8em', color: P, margin: '0 0 8px' }}>⚙️ Settings</h1>
          <p style={{ color: MUTED, margin: 0 }}>Kelola kota, kategori, sub-tipe, dan tempat</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, background: 'white', borderRadius: 16, padding: 6, border: `2px solid ${S}` }}>
          {([['cities', '🏙️ Kota'], ['categories', '🗂️ Kategori'], ['places', '📍 Tempat']] as [Tab, string][]).map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: '0.88em', cursor: 'pointer', background: tab === v ? P : 'transparent', color: tab === v ? 'white' : MUTED, transition: 'all 0.2s' }}>{l}</button>
          ))}
        </div>

        {tab === 'cities'     && <CitiesTab />}
        {tab === 'categories' && <CategoriesTab />}
        {tab === 'places'     && <PlacesTab />}
      </main>

      <style dangerouslySetInnerHTML={{__html:'@keyframes spin{to{transform:rotate(360deg)}}'}} />
    </div>
  )
}

// ─── PLACES TAB ───────────────────────────────────────────────────────────────
function PlacesTab() {
  const [ideas, setIdeas]       = useState<TripIdea[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [toast, setToast]       = useState<{msg:string;type:any}|null>(null)
  const [dialog, setDialog]     = useState<{msg:string;onConfirm:()=>void}|null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('trip_ideas_v2').select('*').order('idea_name')
    setIdeas(data || [])
    setLoading(false)
  }

  async function handleDelete(idea: TripIdea) {
    setDialog({
      msg: `Hapus tempat "${idea.idea_name}"? Tindakan ini tidak bisa dibatalkan.`,
      onConfirm: async () => {
        setDialog(null)
        const { error } = await supabase.from('trip_ideas_v2').delete().eq('id', idea.id)
        if (error) return setToast({ msg: 'Gagal menghapus tempat', type: 'error' })
        setIdeas(prev => prev.filter(i => i.id !== idea.id))
        setToast({ msg: `"${idea.idea_name}" dihapus 🗑️`, type: 'success' })
      }
    })
  }

  const categories = useMemo(() => ['all', ...new Set(ideas.map(i => i.category_name).filter(Boolean))], [ideas])

  const filtered = useMemo(() => ideas.filter(i => {
    if (filterCat !== 'all' && i.category_name !== filterCat) return false
    if (search) {
      const q = search.toLowerCase()
      return i.idea_name?.toLowerCase().includes(q) || i.category_name?.toLowerCase().includes(q) || i.subtype_name?.toLowerCase().includes(q)
    }
    return true
  }), [ideas, search, filterCat])

  return (
    <>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {dialog && <ConfirmDialog message={dialog.msg} onConfirm={dialog.onConfirm} onCancel={() => setDialog(null)} />}

      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ fontWeight: 800, color: P, margin: 0, fontSize: '1em' }}>📍 Semua Tempat ({filtered.length}/{ideas.length})</h2>
          <span style={{ fontSize: '0.78em', color: MUTED }}>Klik 🗑️ untuk menghapus</span>
        </div>

        {/* Search + filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Cari nama tempat..."
              style={{ ...inp, paddingRight: search ? 32 : 13 }}
            />
            {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: MUTED }}>✕</button>}
          </div>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...inp, width: 'auto', flexShrink: 0 }}>
            <option value="all">Semua Kategori</option>
            {categories.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? <Spinner /> : filtered.length === 0 ? (
          <Empty text={search || filterCat !== 'all' ? 'Tidak ada hasil pencarian' : 'Belum ada tempat'} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(idea => (
              <div key={idea.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 14,
                background: 'white', border: `1.5px solid ${S}`,
                transition: 'border-color .15s',
              }}>
                {/* Thumbnail */}
                <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: BGM, position: 'relative' }}>
                  {idea.photo_url ? (
                    <Image src={getPublicImageUrl(idea.photo_url)} alt={idea.idea_name} fill style={{ objectFit: 'cover' }} unoptimized />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3em' }}>📍</div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, color: P, fontSize: '0.9em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{idea.idea_name}</p>
                  <p style={{ margin: 0, fontSize: '0.75em', color: MUTED }}>
                    {[idea.category_name, idea.subtype_name].filter(Boolean).join(' · ')}
                    {idea.city_name && <span style={{ marginLeft: 6, color: S, background: BGM, padding: '1px 7px', borderRadius: 999, border: `1px solid ${S}` }}>📍 {idea.city_name}</span>}
                  </p>
                </div>

                {/* Delete button */}
                <button onClick={() => handleDelete(idea)} style={{ padding: '7px 12px', borderRadius: 10, background: '#fff1f2', color: '#f43f5e', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.82em', flexShrink: 0, transition: 'background .15s' }}>
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

// ─── CITIES TAB ───────────────────────────────────────────────────────────────
function CitiesTab() {
  const [cities, setCities]     = useState<City[]>([])
  const [loading, setLoading]   = useState(true)
  const [newName, setNewName]   = useState('')
  const [adding, setAdding]     = useState(false)
  const [editId, setEditId]     = useState<string|null>(null)
  const [editName, setEditName] = useState('')
  const [dragging, setDragging] = useState<number|null>(null)
  const [dragOver, setDragOver] = useState<number|null>(null)
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState<{msg:string;type:any}|null>(null)
  const [dialog, setDialog]     = useState<{msg:string;onConfirm:()=>void}|null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('cities').select('*').order('display_order', { ascending: true })
    setCities(data || []); setLoading(false)
  }

  async function handleAdd() {
    const name = newName.trim()
    if (!name) return setToast({ msg: 'Nama kota tidak boleh kosong!', type: 'warn' })
    if (cities.some(c => c.name.toLowerCase() === name.toLowerCase())) return setToast({ msg: 'Kota sudah ada!', type: 'warn' })
    setAdding(true)
    const maxOrder = cities.length > 0 ? Math.max(...cities.map(c => c.display_order || 0)) : 0
    const { data, error } = await supabase.from('cities').insert([{ name, display_order: maxOrder + 1 }]).select().single()
    setAdding(false)
    if (error) return setToast({ msg: 'Gagal menambah kota', type: 'error' })
    setCities(prev => [...prev, data as City]); setNewName('')
    setToast({ msg: `${name} ditambahkan! 🏙️`, type: 'success' })
  }

  async function handleDelete(city: City) {
    setDialog({ msg: `Hapus kota "${city.name}"?`, onConfirm: async () => {
      setDialog(null)
      const { error } = await supabase.from('cities').delete().eq('id', city.id)
      if (error) return setToast({ msg: 'Gagal menghapus', type: 'error' })
      setCities(prev => prev.filter(c => c.id !== city.id))
      setToast({ msg: `${city.name} dihapus`, type: 'success' })
    }})
  }

  async function handleEditSave(city: City) {
    const name = editName.trim()
    if (!name) return setToast({ msg: 'Nama tidak boleh kosong!', type: 'warn' })
    const { error } = await supabase.from('cities').update({ name }).eq('id', city.id)
    if (error) return setToast({ msg: 'Gagal menyimpan', type: 'error' })
    setCities(prev => prev.map(c => c.id === city.id ? { ...c, name } : c))
    setEditId(null); setToast({ msg: 'Tersimpan! ✅', type: 'success' })
  }

  async function handleSaveOrder() {
    setSaving(true)
    await Promise.all(cities.map((c, i) => supabase.from('cities').update({ display_order: i + 1 }).eq('id', c.id)))
    setSaving(false); setToast({ msg: 'Urutan disimpan! ✅', type: 'success' })
  }

  function handleDragEnd() {
    if (dragging === null || dragOver === null || dragging === dragOver) { setDragging(null); setDragOver(null); return }
    const r = [...cities]; const [m] = r.splice(dragging, 1); r.splice(dragOver, 0, m)
    setCities(r); setDragging(null); setDragOver(null)
  }

  return (
    <>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {dialog && <ConfirmDialog message={dialog.msg} onConfirm={dialog.onConfirm} onCancel={() => setDialog(null)} />}
      <div style={card}>
        <h2 style={{ fontWeight: 800, color: P, margin: '0 0 14px', fontSize: '1em' }}>➕ Tambah Kota</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="Nama kota..." style={inp} />
          <button onClick={handleAdd} disabled={adding} style={{ padding: '9px 20px', borderRadius: 10, background: adding ? BGM : P, color: adding ? MUTED : 'white', border: 'none', fontWeight: 700, cursor: adding ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>{adding ? '⏳' : '+ Tambah'}</button>
        </div>
      </div>

      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontWeight: 800, color: P, margin: 0, fontSize: '1em' }}>📋 Daftar Kota ({cities.length})</h2>
          <button onClick={handleSaveOrder} disabled={saving} style={{ padding: '7px 16px', borderRadius: 10, background: saving ? BGM : P, color: saving ? MUTED : 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.83em' }}>{saving ? '⏳' : '💾 Simpan Urutan'}</button>
        </div>
        <p style={{ fontSize: '0.78em', color: MUTED, margin: '0 0 12px' }}>⠿ Drag untuk reorder</p>
        {loading ? <Spinner /> : cities.length === 0 ? <Empty text="Belum ada kota" /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cities.map((city, idx) => (
              <div key={city.id} draggable onDragStart={() => setDragging(idx)} onDragEnter={() => setDragOver(idx)} onDragEnd={handleDragEnd} onDragOver={e => e.preventDefault()}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 12, background: dragOver === idx ? BGM : 'white', border: `2px solid ${dragging === idx || dragOver === idx ? P : S}`, opacity: dragging === idx ? 0.5 : 1, transition: 'all 0.15s', cursor: 'grab' }}>
                <span style={{ color: MUTED, fontSize: '1.1em' }}>⠿</span>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: BGM, color: P, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72em', fontWeight: 800, border: `1.5px solid ${S}`, flexShrink: 0 }}>{idx+1}</span>
                {editId === city.id
                  ? <input value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => { if(e.key==='Enter') handleEditSave(city); if(e.key==='Escape') setEditId(null) }} autoFocus style={{ ...inp, flex: 1, padding: '5px 10px' }} onClick={e => e.stopPropagation()} />
                  : <span style={{ flex: 1, fontWeight: 700, color: P }}>{city.name}</span>
                }
                <div style={{ display: 'flex', gap: 6 }}>
                  {editId === city.id ? (
                    <><button onClick={() => handleEditSave(city)} style={btnSm(P,'white')}>✓</button><button onClick={() => setEditId(null)} style={btnSm(BGM,P)}>✕</button></>
                  ) : (
                    <><button onClick={() => { setEditId(city.id); setEditName(city.name) }} style={btnSm(BGM,P)}>✏️</button><button onClick={() => handleDelete(city)} style={btnSm('#fff1f2','#f43f5e')}>🗑️</button></>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

// ─── CATEGORIES TAB ───────────────────────────────────────────────────────────
function CategoriesTab() {
  const [cats, setCats]             = useState<IdeaCategory[]>([])
  const [loading, setLoading]       = useState(true)
  const [openCat, setOpenCat]       = useState<string|null>(null)
  const [editItem, setEditItem]     = useState<{id:number; field:'category'|'subtype'; val:string}|null>(null)
  const [newCatName, setNewCatName] = useState('')
  const [addingCat, setAddingCat]   = useState(false)
  const [newSub, setNewSub]         = useState<Record<string,string>>({})
  const [addingSub, setAddingSub]   = useState<Record<string,boolean>>({})
  const [toast, setToast]           = useState<{msg:string;type:any}|null>(null)
  const [dialog, setDialog]         = useState<{msg:string;onConfirm:()=>void}|null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('idea_categories').select('*').order('category').order('subtype')
    setCats(data || []); setLoading(false)
  }

  const grouped = useMemo(() => {
    const map: Record<string, IdeaCategory[]> = {}
    cats.forEach(c => { if (!map[c.category]) map[c.category] = []; map[c.category].push(c) })
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]))
  }, [cats])

  async function handleAddCategory() {
    const name = newCatName.trim()
    if (!name) return setToast({ msg: 'Nama kategori tidak boleh kosong!', type: 'warn' })
    if (cats.some(c => c.category.toLowerCase() === name.toLowerCase())) return setToast({ msg: 'Kategori sudah ada!', type: 'warn' })
    setAddingCat(true)
    const type_key = name.toLowerCase().replace(/\s+/g, '_') + '_new'
    const { data, error } = await supabase.from('idea_categories').insert([{ category: name, subtype: 'Umum', type_key, icon: '📍', photo_url: null }]).select().single()
    setAddingCat(false)
    if (error) return setToast({ msg: 'Gagal menambah kategori', type: 'error' })
    setCats(prev => [...prev, data as IdeaCategory]); setNewCatName('')
    setToast({ msg: `Kategori "${name}" ditambahkan! ✅`, type: 'success' })
    setOpenCat(name)
  }

  async function handleAddSubtype(catName: string) {
    const subName = (newSub[catName] || '').trim()
    if (!subName) return setToast({ msg: 'Nama subtype tidak boleh kosong!', type: 'warn' })
    if (cats.some(c => c.category === catName && c.subtype.toLowerCase() === subName.toLowerCase())) return setToast({ msg: 'Subtype sudah ada!', type: 'warn' })
    setAddingSub(p => ({ ...p, [catName]: true }))
    const type_key = catName.toLowerCase().replace(/\s+/g,'_') + '_' + subName.toLowerCase().replace(/\s+/g,'_')
    const { data, error } = await supabase.from('idea_categories').insert([{ category: catName, subtype: subName, type_key, icon: '📍', photo_url: null }]).select().single()
    setAddingSub(p => ({ ...p, [catName]: false }))
    if (error) return setToast({ msg: 'Gagal menambah subtype', type: 'error' })
    setCats(prev => [...prev, data as IdeaCategory])
    setNewSub(p => ({ ...p, [catName]: '' }))
    setToast({ msg: `Subtype "${subName}" ditambahkan! ✅`, type: 'success' })
  }

  async function handleDelete(item: IdeaCategory) {
    const label = cats.filter(c => c.category === item.category).length === 1 ? `kategori "${item.category}" beserta subtypenya` : `subtype "${item.subtype}"`
    setDialog({ msg: `Hapus ${label}?`, onConfirm: async () => { setDialog(null); await _doDelete(item) } })
  }

  async function _doDelete(item: IdeaCategory) {
    if (cats.filter(c => c.category === item.category).length === 1) {
      const ids = cats.filter(c => c.category === item.category).map(c => c.id)
      await supabase.from('idea_categories').delete().in('id', ids)
      setCats(prev => prev.filter(c => c.category !== item.category))
    } else {
      const { error } = await supabase.from('idea_categories').delete().eq('id', item.id)
      if (error) return setToast({ msg: 'Gagal menghapus', type: 'error' })
      setCats(prev => prev.filter(c => c.id !== item.id))
    }
    setToast({ msg: 'Berhasil dihapus 🗑️', type: 'success' })
  }

  async function handleDeleteCategory(catName: string) {
    setDialog({ msg: `Hapus semua subtype dalam kategori "${catName}"?`, onConfirm: async () => {
      setDialog(null)
      const ids = cats.filter(c => c.category === catName).map(c => c.id)
      await supabase.from('idea_categories').delete().in('id', ids)
      setCats(prev => prev.filter(c => c.category !== catName))
      setToast({ msg: `Kategori "${catName}" dihapus 🗑️`, type: 'success' })
    }})
  }

  async function handleEditSave() {
    if (!editItem) return
    const val = editItem.val.trim()
    if (!val) return setToast({ msg: 'Tidak boleh kosong!', type: 'warn' })
    const { error } = await supabase.from('idea_categories').update({ [editItem.field]: val }).eq('id', editItem.id)
    if (error) return setToast({ msg: 'Gagal menyimpan', type: 'error' })
    if (editItem.field === 'category') {
      const oldCat = cats.find(c => c.id === editItem.id)?.category
      await supabase.from('idea_categories').update({ category: val }).eq('category', oldCat)
      setCats(prev => prev.map(c => c.category === oldCat ? { ...c, category: val } : c))
    } else {
      setCats(prev => prev.map(c => c.id === editItem.id ? { ...c, subtype: val } : c))
    }
    setEditItem(null); setToast({ msg: 'Tersimpan! ✅', type: 'success' })
  }

  return (
    <>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {dialog && <ConfirmDialog message={dialog.msg} onConfirm={dialog.onConfirm} onCancel={() => setDialog(null)} />}

      <div style={card}>
        <h2 style={{ fontWeight: 800, color: P, margin: '0 0 14px', fontSize: '1em' }}>➕ Tambah Kategori Baru</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <input value={newCatName} onChange={e => setNewCatName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddCategory()} placeholder="Nama kategori..." style={inp} />
          <button onClick={handleAddCategory} disabled={addingCat} style={{ padding: '9px 20px', borderRadius: 10, background: addingCat ? BGM : P, color: addingCat ? MUTED : 'white', border: 'none', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>{addingCat ? '⏳' : '+ Tambah'}</button>
        </div>
      </div>

      <div style={card}>
        <h2 style={{ fontWeight: 800, color: P, margin: '0 0 16px', fontSize: '1em' }}>🗂️ Semua Kategori ({grouped.length})</h2>
        {loading ? <Spinner /> : grouped.length === 0 ? <Empty text="Belum ada kategori" /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {grouped.map(([catName, items]) => {
              const isOpen = openCat === catName
              return (
                <div key={catName} style={{ borderRadius: 14, border: `2px solid ${isOpen ? P : S}`, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '11px 14px', background: isOpen ? BGM : 'white', gap: 10, cursor: 'pointer' }} onClick={() => setOpenCat(isOpen ? null : catName)}>
                    <span style={{ fontSize: '1em', transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'none', color: MUTED }}>›</span>
                    {editItem?.id === items[0].id && editItem.field === 'category'
                      ? <input value={editItem.val} onChange={e => setEditItem({...editItem, val: e.target.value})} onKeyDown={e => { if(e.key==='Enter') handleEditSave(); if(e.key==='Escape') setEditItem(null) }} autoFocus onClick={e => e.stopPropagation()} style={{ ...inp, flex: 1, padding: '5px 10px' }} />
                      : <span style={{ flex: 1, fontWeight: 800, color: P, fontSize: '0.95em' }}>{catName}</span>
                    }
                    <span style={{ fontSize: '0.78em', color: MUTED, marginRight: 8 }}>{items.length} subtype</span>
                    <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                      {editItem?.id === items[0].id && editItem.field === 'category'
                        ? <><button onClick={handleEditSave} style={btnSm(P,'white')}>✓</button><button onClick={() => setEditItem(null)} style={btnSm(BGM,P)}>✕</button></>
                        : <><button onClick={() => setEditItem({ id: items[0].id as number, field: 'category', val: catName })} style={btnSm(BGM,P)}>✏️</button><button onClick={() => handleDeleteCategory(catName)} style={btnSm('#fff1f2','#f43f5e')}>🗑️</button></>
                      }
                    </div>
                  </div>
                  {isOpen && (
                    <div style={{ borderTop: `2px solid ${S}`, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {items.map(item => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: 'white', border: `1.5px solid ${S}` }}>
                          <span style={{ fontSize: '0.88em' }}>{item.icon || '📍'}</span>
                          {editItem?.id === item.id && editItem.field === 'subtype'
                            ? <input value={editItem.val} onChange={e => setEditItem({...editItem, val: e.target.value})} onKeyDown={e => { if(e.key==='Enter') handleEditSave(); if(e.key==='Escape') setEditItem(null) }} autoFocus style={{ ...inp, flex: 1, padding: '5px 10px', fontSize: '0.88em' }} />
                            : <span style={{ flex: 1, fontSize: '0.88em', fontWeight: 600, color: P }}>{item.subtype}</span>
                          }
                          <span style={{ fontSize: '0.73em', color: MUTED, fontFamily: 'monospace' }}>{item.type_key}</span>
                          <div style={{ display: 'flex', gap: 5 }}>
                            {editItem?.id === item.id && editItem.field === 'subtype'
                              ? <><button onClick={handleEditSave} style={btnSm(P,'white')}>✓</button><button onClick={() => setEditItem(null)} style={btnSm(BGM,P)}>✕</button></>
                              : <><button onClick={() => setEditItem({ id: item.id as number, field: 'subtype', val: item.subtype })} style={btnSm(BGM,P)}>✏️</button><button onClick={() => handleDelete(item)} style={btnSm('#fff1f2','#f43f5e')}>🗑️</button></>
                            }
                          </div>
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <input value={newSub[catName] || ''} onChange={e => setNewSub(p => ({ ...p, [catName]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleAddSubtype(catName)} placeholder="Tambah subtype baru..." style={{ ...inp, fontSize: '0.88em', padding: '7px 12px' }} />
                        <button onClick={() => handleAddSubtype(catName)} disabled={addingSub[catName]} style={{ padding: '7px 14px', borderRadius: 10, background: addingSub[catName] ? BGM : P, color: addingSub[catName] ? MUTED : 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.85em', whiteSpace: 'nowrap' }}>
                          {addingSub[catName] ? '⏳' : '+ Add'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function btnSm(bg: string, color: string): React.CSSProperties {
  return { padding: '5px 10px', borderRadius: 8, background: bg, color, border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.8em', flexShrink: 0 }
}
function Spinner() {
  return <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div style={{ width: 36, height: 36, border: `3px solid ${S}`, borderTopColor: P, borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>
}
function Empty({ text }: { text: string }) {
  return <div style={{ textAlign: 'center', padding: '40px 20px', border: `2px dashed ${S}`, borderRadius: 14, color: MUTED, fontWeight: 600 }}>{text}</div>
}