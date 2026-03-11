'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Navbar from '@/components/ui/Navbar'
import { useData } from '@/context/DataContext'
import { supabase } from '@/lib/supabase'
import { uploadImage } from '@/lib/utils'
import ActivityArea from './ActivityArea'
import SelectedPanel from './SelectedPanel'
import IdeaDetailModal from './IdeaDetailModal'
import EditLocationModal from './EditLocationModal'
import Countdown from './Countdown'
import Toast from '@/components/ui/Toast'
import type { LocalSelection, IdeaReview } from '@/types/types'

const T = {
  navy: '#03254c', navyMid: '#1a4d7a', navyLight: '#2563a8',
  sky: '#c4e8ff', skyLight: '#e1f3ff', skyMid: '#a8d8f0',
  bg: '#d0efff', white: '#ffffff',
  muted: '#6b8cae', mutedLight: '#a0bcd4',
}

export default function HomePage() {
  const { ideas, categories, cities, reviews, ideaRatings, loading, loadAllData, loadReviews } = useData()
  const [tripDate, setTripDate]           = useState('')
  const [secretMsg, setSecretMsg]         = useState('')
  const [selectedIds, setSelectedIds]     = useState<Set<string>>(new Set())
  const [selections, setSelections]       = useState<LocalSelection[]>([])
  const [search, setSearch]               = useState('')
  const [detailIdeaId, setDetailIdeaId]   = useState<string | null>(null)
  const [detailReviews, setDetailReviews] = useState<IdeaReview[]>([])
  const [tripDates, setTripDates]         = useState<Record<string, any>>({})
  const [editLocIdeaId, setEditLocIdeaId] = useState<string | null>(null)
  const [showAdd, setShowAdd]             = useState(false)
  const [newName, setNewName]             = useState('')
  const [newCat, setNewCat]               = useState('')
  const [newCatCustom, setNewCatCustom]   = useState('')
  const [newSub, setNewSub]               = useState('')
  const [newSubCustom, setNewSubCustom]   = useState('')
  const [newCity, setNewCity]             = useState('')
  const [newFile, setNewFile]             = useState<File | null>(null)
  const [addingIdea, setAddingIdea]       = useState(false)
  const [isEditMode, setIsEditMode]       = useState(false)
  const [toast, setToast]                 = useState<{ msg: string; type: any } | null>(null)
  const ideasLoaded = useRef(false)

  useEffect(() => {
    loadAllData()
    setTripDate(localStorage.getItem('tripDate') || '')
    setSecretMsg(localStorage.getItem('secretMessage') || '')
    setIsEditMode(localStorage.getItem('editMode') === 'true')
    const raw = localStorage.getItem('tripSelections')
    if (raw) {
      try {
        const parsed: LocalSelection[] = JSON.parse(raw)
        const deduped = parsed.filter((s, i, a) => a.findIndex(x => x.ideaId === s.ideaId) === i)
        setSelections(deduped)
        setSelectedIds(new Set(deduped.map(s => s.ideaId)))
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
          if (idea) return [...s, { ideaId: idea.id, name: idea.idea_name, cat: idea.category_name || '', subtype: idea.subtype_name || '' }]
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
      (data || []).forEach((t: any) => { map[t.id] = t })
      setTripDates(map)
    }
    setDetailReviews(ideaReviews)
    setDetailIdeaId(ideaId)
  }

  const handleGenerate = () => {
    if (!tripDate) return setToast({ msg: 'Pilih tanggal trip dulu!', type: 'warn' })
    if (selections.length === 0) return setToast({ msg: 'Pilih minimal 1 aktivitas!', type: 'warn' })
    window.location.href = '/summary'
  }

  const resetAdd = () => {
    setNewName(''); setNewCat(''); setNewCatCustom('')
    setNewSub(''); setNewSubCustom(''); setNewCity(''); setNewFile(null)
  }

  const handleAddIdea = async () => {
    const finalName = newName.trim()
    const finalCat  = newCat === '__custom__' ? newCatCustom.trim() : newCat
    const finalSub  = newSub === '__custom__' ? newSubCustom.trim() : newSub
    if (!finalName) return setToast({ msg: 'Nama tidak boleh kosong!', type: 'warn' })
    if (!finalCat)  return setToast({ msg: 'Pilih atau isi kategori!', type: 'warn' })
    if (!finalSub)  return setToast({ msg: 'Pilih atau isi sub-tipe!', type: 'warn' })
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
      setShowAdd(false)
      resetAdd()
      setToast({ msg: 'Ide berhasil ditambahkan! 🎉', type: 'success' })
    } catch {
      setToast({ msg: 'Gagal menyimpan. Coba lagi.', type: 'error' })
    } finally {
      setAddingIdea(false)
    }
  }

  const uniqueCats     = [...new Set(categories.map(c => c.category))]
  const subtypesForCat = categories.filter(c => c.category === newCat)
  const detailIdea     = detailIdeaId ? ideas.find(i => i.id === detailIdeaId) : null
  const editLocIdea    = editLocIdeaId ? ideas.find(i => i.id === editLocIdeaId) : null
  const canGenerate    = tripDate && selections.length > 0

  const inp: React.CSSProperties = {
    width: '100%', padding: '9px 12px',
    border: `1.5px solid ${T.sky}`, borderRadius: 10,
    fontSize: '0.87em', color: T.navy, background: T.white,
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
        * { box-sizing: border-box; }
        input:focus, select:focus, textarea:focus { border-color: ${T.navyLight} !important; outline: none; box-shadow: 0 0 0 3px ${T.skyMid}66; }
        input[type='date']::-webkit-calendar-picker-indicator { opacity: 0.4; cursor: pointer; }
        .sticky-bar { transition: box-shadow .2s; }
      `}</style>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <Navbar />

      {/* Sticky control bar */}
      <div className="sticky-bar" style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(208,239,255,0.95)',
        backdropFilter: 'blur(14px)',
        borderBottom: `1.5px solid ${T.skyMid}`,
        padding: '10px 16px 10px',
        boxShadow: '0 2px 16px rgba(3,37,76,.08)',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>

          {isEditMode && (
            <div style={{ padding: '6px 12px', borderRadius: 8, background: '#fffbeb', border: '1.5px solid #fcd34d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, color: '#92400e', fontSize: '0.8em' }}>✏️ Mode edit trip aktif</span>
              <button
                onClick={() => {
                  localStorage.removeItem('editMode')
                  localStorage.removeItem('editTripId')
                  localStorage.removeItem('tripSelections')
                  localStorage.removeItem('tripDate')
                  setIsEditMode(false)
                  setSelections([])
                  setSelectedIds(new Set())
                }}
                style={{ background: 'none', border: 'none', color: '#f59e0b', fontWeight: 700, cursor: 'pointer', fontSize: '0.78em' }}
              >✕ Batal</button>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input type='date' value={tripDate} onChange={e => setTripDate(e.target.value)}
              style={{ ...inp, width: 158, flexShrink: 0 }} />

            <div style={{ flex: 1, minWidth: 160, position: 'relative' }}>
              <input type='text' value={secretMsg} onChange={e => setSecretMsg(e.target.value)}
                placeholder='💌 Pesan rahasia...'
                style={{ ...inp, width: '100%', paddingRight: secretMsg ? 30 : 12 }} />
              {secretMsg && <span style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', fontSize: '0.8em', pointerEvents: 'none' }}>✨</span>}
            </div>

            <button onClick={() => setShowAdd(true)} style={{
              padding: '9px 14px', borderRadius: 10,
              background: T.white, color: T.navy,
              border: `1.5px solid ${T.sky}`,
              fontWeight: 600, cursor: 'pointer', fontSize: '0.82em', whiteSpace: 'nowrap',
              boxShadow: '0 1px 4px rgba(3,37,76,.07)',
            }}>➕ Tambah Ide</button>

            <button onClick={handleGenerate} disabled={!canGenerate} style={{
              padding: '9px 18px', borderRadius: 10,
              background: canGenerate ? `linear-gradient(135deg, ${T.navy}, ${T.navyMid})` : T.skyMid,
              color: canGenerate ? T.white : T.mutedLight,
              border: 'none', fontWeight: 700, cursor: canGenerate ? 'pointer' : 'not-allowed',
              fontSize: '0.84em', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: canGenerate ? '0 2px 12px rgba(3,37,76,.28)' : 'none',
              transition: 'all .15s',
            }}>
              {isEditMode ? '🔄 Update' : '🎫 Generate'}
              {selections.length > 0 && (
                <span style={{ background: 'rgba(255,255,255,0.22)', borderRadius: 999, padding: '1px 7px', fontSize: '0.78em' }}>
                  {selections.length}
                </span>
              )}
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: T.mutedLight, fontSize: '0.82em', pointerEvents: 'none' }}>🔍</span>
            <input type='text' value={search} onChange={e => setSearch(e.target.value)}
              placeholder='Cari tempat atau kategori...'
              style={{ ...inp, width: '100%', paddingLeft: 32, paddingRight: search ? 32 : 12 }} />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.mutedLight, fontSize: '0.85em' }}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Main */}
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '14px 16px 80px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tripDate && <Countdown tripDate={tripDate} />}

        <SelectedPanel
          selections={selections}
          onRemove={handleRemove}
          onClearAll={() => { setSelectedIds(new Set()); setSelections([]); setToast({ msg: 'Semua dihapus', type: 'info' }) }}
          onLocate={id => document.querySelector('[data-ideaid="' + id + '"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
        />

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 34, height: 34, border: `3px solid ${T.sky}`, borderTopColor: T.navy, borderRadius: '50%', animation: 'spin 0.85s linear infinite' }} />
          </div>
        ) : (
          <ActivityArea
            ideas={ideas} categories={categories} cities={cities}
            ideaRatings={ideaRatings} selectedIds={selectedIds}
            searchQuery={search} tripDate={tripDate}
            onToggle={handleToggle} onViewDetail={handleViewDetail}
          />
        )}
      </main>

      {/* Detail Modal */}
      {detailIdea && (
        <IdeaDetailModal
          idea={detailIdea} reviews={detailReviews}
          rating={ideaRatings[detailIdea.id]} tripDates={tripDates}
          onClose={() => setDetailIdeaId(null)}
          onEditInfo={(id) => { setDetailIdeaId(null); setEditLocIdeaId(id) }}
          onReviewSaved={() => { loadReviews(); handleViewDetail(detailIdea.id) }}
        />
      )}

      {/* Edit Location Modal */}
      {editLocIdea && (
        <EditLocationModal
          idea={editLocIdea}
          onClose={() => setEditLocIdeaId(null)}
          onSaved={() => { loadAllData(); setEditLocIdeaId(null) }}
        />
      )}

      {/* Add Idea Modal */}
      {showAdd && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(3,37,76,0.38)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' }}
          onClick={e => { if (e.target === e.currentTarget) { setShowAdd(false); resetAdd() } }}
        >
          <div style={{ background: T.white, borderRadius: 20, border: `1.5px solid ${T.sky}`, boxShadow: '0 20px 60px rgba(3,37,76,.2)', width: '100%', maxWidth: 460, margin: 'auto' }}>
            <div style={{ padding: '20px 22px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ color: T.navy, fontWeight: 800, margin: 0, fontSize: '1.02em' }}>➕ Tambah Ide Baru</h3>
                <button
                  onClick={() => { setShowAdd(false); resetAdd() }}
                  style={{ background: T.skyLight, border: `1px solid ${T.sky}`, borderRadius: 999, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.navy, fontWeight: 700, fontSize: '0.8em' }}
                >✕</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                <div>
                  <label style={{ fontSize: '0.7em', fontWeight: 700, color: T.muted, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Nama Tempat *</label>
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder='misal: Braga Permai' style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7em', fontWeight: 700, color: T.muted, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Kategori *</label>
                  <select value={newCat} onChange={e => { setNewCat(e.target.value); setNewSub('') }} style={inp}>
                    <option value=''>Pilih...</option>
                    {uniqueCats.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value='__custom__'>➕ Tambah baru...</option>
                  </select>
                  {newCat === '__custom__' && (
                    <input value={newCatCustom} onChange={e => setNewCatCustom(e.target.value)} placeholder='Nama kategori baru' style={{ ...inp, marginTop: 7 }} />
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '0.7em', fontWeight: 700, color: T.muted, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Sub-tipe *</label>
                  <select value={newSub} onChange={e => setNewSub(e.target.value)} disabled={!newCat} style={{ ...inp, opacity: !newCat ? 0.5 : 1 }}>
                    <option value=''>Pilih...</option>
                    {newCat !== '__custom__' && subtypesForCat.map(s => <option key={s.type_key} value={s.type_key}>{s.subtype}</option>)}
                    <option value='__custom__'>➕ Tambah baru...</option>
                  </select>
                  {newSub === '__custom__' && (
                    <input value={newSubCustom} onChange={e => setNewSubCustom(e.target.value)} placeholder='Nama sub-tipe baru' style={{ ...inp, marginTop: 7 }} />
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '0.7em', fontWeight: 700, color: T.muted, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Kota</label>
                  <select value={newCity} onChange={e => setNewCity(e.target.value)} style={inp}>
                    <option value=''>Tanpa Kota</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.7em', fontWeight: 700, color: T.muted, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Foto (Opsional)</label>
                  <input type='file' accept='image/*' onChange={e => setNewFile(e.target.files?.[0] || null)} style={{ fontSize: '0.8em', color: T.navy, width: '100%' }} />
                </div>
              </div>
              <button
                onClick={handleAddIdea}
                disabled={addingIdea}
                style={{
                  width: '100%', marginTop: 16, padding: '12px', borderRadius: 11,
                  background: addingIdea ? T.sky : `linear-gradient(135deg, ${T.navy}, ${T.navyMid})`,
                  color: addingIdea ? T.muted : T.white,
                  border: 'none', fontWeight: 700, cursor: addingIdea ? 'not-allowed' : 'pointer',
                  fontSize: '0.9em', boxShadow: addingIdea ? 'none' : '0 4px 14px rgba(3,37,76,.2)',
                  transition: 'all .15s',
                }}
              >{addingIdea ? '⏳ Menyimpan...' : '💾 Simpan Ide'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}