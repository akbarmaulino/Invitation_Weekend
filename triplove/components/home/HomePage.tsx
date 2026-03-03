'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Navbar from '@/components/ui/Navbar'
import { useData } from '@/context/DataContext'
import { supabase } from '@/lib/supabase'
import { uploadImage } from '@/lib/utils'
import ActivityArea from './ActivityArea'
import SelectedPanel from './SelectedPanel'
import IdeaDetailModal from './IdeaDetailModal'
import Countdown from './Countdown'
import Toast from '@/components/ui/Toast'
import type { LocalSelection, IdeaReview } from '@/types/types'

const P = '#03254c', PL = '#e1f3ff', PB = '#c4e8ff', PINK = '#1a4d7a', TEXT = '#03254c', MUTED = '#9ca3af'

export default function HomePage() {
  const { ideas, categories, cities, reviews, ideaRatings, loading, loadAllData, loadReviews } = useData()
  const [tripDate, setTripDate]     = useState('')
  const [secretMsg, setSecretMsg]   = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selections, setSelections] = useState<LocalSelection[]>([])
  const [search, setSearch]         = useState('')
  const [detailIdeaId, setDetailIdeaId] = useState<string | null>(null)
  const [detailReviews, setDetailReviews] = useState<IdeaReview[]>([])
  const [tripDates, setTripDates]   = useState<Record<string, any>>({})
  const [showAdd, setShowAdd]       = useState(false)
  const [newName, setNewName]       = useState('')
  const [newCat, setNewCat]         = useState('')
  const [newCatCustom, setNewCatCustom] = useState('')
  const [newSub, setNewSub]         = useState('')
  const [newSubCustom, setNewSubCustom] = useState('')
  const [newCity, setNewCity]       = useState('')
  const [newFile, setNewFile]       = useState<File | null>(null)
  const [addingIdea, setAddingIdea] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [toast, setToast]           = useState<{msg:string;type:any}|null>(null)
  const ideasLoaded                 = useRef(false)

  useEffect(() => {
    loadAllData()
    setTripDate(localStorage.getItem('tripDate') || '')
    setSecretMsg(localStorage.getItem('secretMessage') || '')
    setIsEditMode(localStorage.getItem('editMode') === 'true')
    const raw = localStorage.getItem('tripSelections')
    if (raw) {
      try {
        const parsed: LocalSelection[] = JSON.parse(raw)
        const deduped = parsed.filter((s,i,a) => a.findIndex(x => x.ideaId === s.ideaId) === i)
        setSelections(deduped); setSelectedIds(new Set(deduped.map(s => s.ideaId)))
      } catch { localStorage.removeItem('tripSelections') }
    }
  }, [])

  useEffect(() => { if (ideas.length > 0) ideasLoaded.current = true }, [ideas])

  useEffect(() => {
    localStorage.setItem('tripSelections', JSON.stringify(selections))
    localStorage.setItem('tripDate', tripDate)
    localStorage.setItem('secretMessage', secretMsg)
  }, [selections, tripDate, secretMsg])

  const handleToggle = useCallback((ideaId: string) => {
    if (!ideasLoaded.current) return
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(ideaId)) {
        next.delete(ideaId)
        setSelections(s => s.filter(sel => sel.ideaId !== ideaId))
      } else {
        next.add(ideaId)
        setSelections(s => {
          if (s.some(sel => sel.ideaId === ideaId)) return s
          const idea = ideas.find(i => i.id === ideaId)
          if (idea) return [...s, { ideaId: idea.id, name: idea.idea_name, cat: idea.category_name||'', subtype: idea.subtype_name||'' }]
          return s
        })
      }
      return next
    })
  }, [ideas])

  const handleRemove = useCallback((ideaId: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.delete(ideaId); return n })
    setSelections(prev => prev.filter(s => s.ideaId !== ideaId))
  }, [])

  const handleViewDetail = async (ideaId: string) => {
    const ideaReviews = reviews.filter(r => r.idea_id === ideaId)
    const tripIds = [...new Set(ideaReviews.map(r => r.trip_id).filter(Boolean))] as string[]
    if (tripIds.length > 0) {
      const { data } = await supabase.from('trip_history').select('id,trip_date,trip_day').in('id', tripIds)
      const map: Record<string, any> = {};
      (data||[]).forEach((t:any) => { map[t.id] = t })
      setTripDates(map)
    }
    setDetailReviews(ideaReviews); setDetailIdeaId(ideaId)
  }

  const handleGenerate = () => {
    if (!tripDate) return setToast({msg:'Pilih tanggal trip dulu!', type:'warn'})
    if (selections.length === 0) return setToast({msg:'Pilih minimal 1 aktivitas!', type:'warn'})
    window.location.href = '/summary'
  }

  const resetAdd = () => { setNewName(''); setNewCat(''); setNewCatCustom(''); setNewSub(''); setNewSubCustom(''); setNewCity(''); setNewFile(null) }

  const handleAddIdea = async () => {
    const finalName = newName.trim()
    const finalCat  = newCat === '__custom__' ? newCatCustom.trim() : newCat
    const finalSub  = newSub === '__custom__' ? newSubCustom.trim()  : newSub
    if (!finalName) return setToast({msg:'Nama tidak boleh kosong!', type:'warn'})
    if (!finalCat)  return setToast({msg:'Pilih atau isi kategori!', type:'warn'})
    if (!finalSub)  return setToast({msg:'Pilih atau isi sub-tipe!', type:'warn'})
    setAddingIdea(true)
    try {
      let imageUrl: string | null = null
      if (newFile) imageUrl = await uploadImage(newFile, 'anon')
      if (newCat === '__custom__' || newSub === '__custom__') {
        const tk = finalSub.toLowerCase().replace(/\s+/g, '_')
        await supabase.from('idea_categories').upsert([{ category: finalCat, subtype: finalSub, type_key: tk, icon: '📍', photo_url: null }], { onConflict: 'type_key' })
      }
      const typeKey = newSub === '__custom__' ? finalSub.toLowerCase().replace(/\s+/g, '_') : newSub
      const { error } = await supabase.from('trip_ideas_v2').insert([{ idea_name: finalName, type_key: typeKey, day_of_week: '', photo_url: imageUrl, city_id: newCity || null }])
      if (error) throw error
      await loadAllData()
      setShowAdd(false); resetAdd()
      setToast({msg:'Ide berhasil ditambahkan! 🎉', type:'success'})
    } catch(err) {
      setToast({msg:'Gagal menyimpan. Coba lagi.', type:'error'})
    } finally { setAddingIdea(false) }
  }

  const uniqueCats    = [...new Set(categories.map(c => c.category))]
  const subtypesForCat = categories.filter(c => c.category === newCat)
  const detailIdea    = detailIdeaId ? ideas.find(i => i.id === detailIdeaId) : null

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '2px solid #c4e8ff', borderRadius: 12, fontSize: '0.93em', color: TEXT, background: 'white', outline: 'none', boxSizing: 'border-box' }

  return (
    <div style={{ minHeight: '100vh', background: '#d0efff' }}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <Navbar />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Edit mode banner */}
        {isEditMode && (
          <div style={{ padding: '12px 18px', borderRadius: 16, background: '#fffbeb', border: '2px solid #fcd34d', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontWeight: 700, color: '#92400e', fontSize: '0.9em' }}>✏️ Mode edit trip — ubah aktivitas lalu generate ulang</span>
            <button onClick={() => { localStorage.removeItem('editMode'); localStorage.removeItem('editTripId'); localStorage.removeItem('tripSelections'); localStorage.removeItem('tripDate'); setIsEditMode(false); setSelections([]); setSelectedIds(new Set()); setToast({msg:'Edit dibatalkan',type:'info'}) }} style={{ background: 'none', border: 'none', color: '#f59e0b', fontWeight: 700, cursor: 'pointer', fontSize: '0.85em' }}>✕ Batal</button>
          </div>
        )}

        {/* Controls */}
        <div style={{ padding: 20, borderRadius: 20, background: 'white', border: '2px solid #c4e8ff', boxShadow: '0 2px 12px rgba(168,85,247,0.08)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.75em', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5 }}>📅 Tanggal Trip</label>
              <input type='date' value={tripDate} onChange={e => setTripDate(e.target.value)} style={{ ...inp, width: 180 }} />
            </div>
            <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.75em', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5 }}>💌 Pesan Rahasia</label>
              <input type='text' value={secretMsg} onChange={e => setSecretMsg(e.target.value)} placeholder='Tulis sesuatu yang manis...' style={inp} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowAdd(true)} style={{ padding: '10px 18px', borderRadius: 999, background: '#e1f3ff', color: P, border: '2px solid #a8d8f0', fontWeight: 700, cursor: 'pointer', fontSize: '0.88em' }}>➕ Tambah Ide</button>
              <button onClick={handleGenerate} disabled={!tripDate || selections.length === 0} style={{ padding: '10px 20px', borderRadius: 999, background: !tripDate || selections.length === 0 ? '#a8d8f0' : 'linear-gradient(135deg, #03254c, #1a4d7a)', color: !tripDate || selections.length === 0 ? '#9ca3af' : 'white', border: 'none', fontWeight: 800, cursor: !tripDate || selections.length === 0 ? 'not-allowed' : 'pointer', fontSize: '0.88em', display: 'flex', alignItems: 'center', gap: 8, boxShadow: !tripDate || selections.length === 0 ? 'none' : '0 4px 14px rgba(168,85,247,0.35)' }}>
                {isEditMode ? '🔄 Update' : '🎫 Generate Tiket'}
                {selections.length > 0 && <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 999, padding: '1px 8px', fontSize: '0.82em' }}>{selections.length}</span>}
              </button>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <input type='text' value={search} onChange={e => setSearch(e.target.value)} placeholder='🔍 Cari aktivitas...' style={inp} />
            {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: '1em' }}>✕</button>}
          </div>
        </div>

        {tripDate && <Countdown tripDate={tripDate} />}
        <SelectedPanel selections={selections} onRemove={handleRemove} onClearAll={() => { setSelectedIds(new Set()); setSelections([]); setToast({msg:'Semua dihapus',type:'info'}) }} onLocate={id => document.querySelector('[data-ideaid="' + id + '"]')?.scrollIntoView({behavior:'smooth',block:'center'})} />

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 40, height: 40, border: '4px solid #c4e8ff', borderTopColor: P, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <ActivityArea ideas={ideas} categories={categories} cities={cities} ideaRatings={ideaRatings} selectedIds={selectedIds} searchQuery={search} tripDate={tripDate} onToggle={handleToggle} onViewDetail={handleViewDetail} />
        )}
      </main>

      {/* Detail Modal */}
      {detailIdea && <IdeaDetailModal idea={detailIdea} reviews={detailReviews} rating={ideaRatings[detailIdea.id]} tripDates={tripDates} onClose={() => setDetailIdeaId(null)} onEditInfo={() => {}} onReviewSaved={() => { loadReviews(); handleViewDetail(detailIdea.id) }} />}

      {/* Add Idea Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(30,27,75,0.4)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 16px', overflowY: 'auto' }} onClick={e => { if (e.target === e.currentTarget) { setShowAdd(false); resetAdd() } }}>
          <div style={{ background: 'white', borderRadius: 24, border: '2px solid #c4e8ff', boxShadow: '0 16px 48px rgba(168,85,247,0.2)', width: '100%', maxWidth: 480, margin: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h3 style={{ color: P, fontWeight: 800, margin: 0, fontSize: '1.15em' }}>➕ Tambah Ide Baru</h3>
              <button onClick={() => { setShowAdd(false); resetAdd() }} style={{ background: 'none', border: 'none', color: MUTED, fontSize: '1.3em', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={{ fontSize: '0.8em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 6 }}>Nama Tempat *</label><input value={newName} onChange={e => setNewName(e.target.value)} placeholder='misal: Braga Permai' style={inp} /></div>
              <div>
                <label style={{ fontSize: '0.8em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 6 }}>Kategori *</label>
                <select value={newCat} onChange={e => { setNewCat(e.target.value); setNewSub('') }} style={inp}><option value=''>Pilih...</option>{uniqueCats.map(c => <option key={c} value={c}>{c}</option>)}<option value='__custom__'>➕ Tambah baru...</option></select>
                {newCat === '__custom__' && <input value={newCatCustom} onChange={e => setNewCatCustom(e.target.value)} placeholder='Nama kategori baru' style={{ ...inp, marginTop: 8 }} />}
              </div>
              <div>
                <label style={{ fontSize: '0.8em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 6 }}>Sub-tipe *</label>
                <select value={newSub} onChange={e => setNewSub(e.target.value)} disabled={!newCat} style={{ ...inp, opacity: !newCat ? 0.5 : 1 }}><option value=''>Pilih...</option>{newCat !== '__custom__' && subtypesForCat.map(s => <option key={s.type_key} value={s.type_key}>{s.subtype}</option>)}<option value='__custom__'>➕ Tambah baru...</option></select>
                {newSub === '__custom__' && <input value={newSubCustom} onChange={e => setNewSubCustom(e.target.value)} placeholder='Nama sub-tipe baru' style={{ ...inp, marginTop: 8 }} />}
              </div>
              <div><label style={{ fontSize: '0.8em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 6 }}>Kota</label><select value={newCity} onChange={e => setNewCity(e.target.value)} style={inp}><option value=''>Tanpa Kota</option>{cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label style={{ fontSize: '0.8em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 6 }}>Foto (Opsional)</label><input type='file' accept='image/*' onChange={e => setNewFile(e.target.files?.[0]||null)} style={{ fontSize: '0.88em', color: TEXT }} /></div>
            </div>
            <button onClick={handleAddIdea} disabled={addingIdea} style={{ width: '100%', marginTop: 22, padding: '13px', borderRadius: 999, background: addingIdea ? '#a8d8f0' : 'linear-gradient(135deg, #03254c, #1a4d7a)', color: 'white', border: 'none', fontWeight: 800, cursor: addingIdea ? 'not-allowed' : 'pointer', fontSize: '0.95em', boxShadow: addingIdea ? 'none' : '0 4px 14px rgba(168,85,247,0.35)' }}>
              {addingIdea ? '⏳ Menyimpan...' : '💾 Simpan Ide'}
            </button>
          </div>
        </div>
      )}

      <style>{}</style>
    </div>
  )
}