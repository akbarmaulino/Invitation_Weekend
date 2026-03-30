'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Navbar from '@/components/ui/Navbar'
import { useData } from '@/context/DataContext'
import { supabase } from '@/lib/supabase'
import ActivityArea from './ActivityArea'
import SelectedPanel from './SelectedPanel'
import IdeaDetailModal from './IdeaDetailModal'
import EditLocationModal from './EditLocationModal'
import AddIdeaModal from './AddIdeaModal'
import Countdown from './Countdown'
import Toast from '@/components/ui/Toast'
import type { LocalSelection, IdeaReview } from '@/types/types'

const T = {
  navy: '#03254c', navyMid: '#1a4d7a', navyLight: '#2563a8',
  sky: '#c4e8ff', skyLight: '#e1f3ff', skyMid: '#a8d8f0',
  bg: '#d0efff', white: '#ffffff',
  muted: '#6b8cae', mutedLight: '#a0bcd4',
}

const inp: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  border: `1.5px solid ${T.sky}`, borderRadius: 10,
  fontSize: '0.87em', color: T.navy, background: T.white,
  outline: 'none', boxSizing: 'border-box',
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
  const [isEditMode, setIsEditMode]       = useState(false)
  const [toast, setToast]                 = useState<{ msg: string; type: any } | null>(null)
  const ideasLoaded = useRef(false)

  useEffect(() => {
    loadAllData()
    setTripDate(localStorage.getItem('tripDate') || '')
    setSecretMsg(localStorage.getItem('secretMessage') || '')
    setIsEditMode(localStorage.getItem('editMode') === 'true')
    const raw = localStorage.getItem('tripSelections')
    if (!raw) return
    try {
      const parsed: LocalSelection[] = JSON.parse(raw)
      const deduped = parsed.filter((s, i, a) => a.findIndex(x => x.ideaId === s.ideaId) === i)
      setSelections(deduped)
      setSelectedIds(new Set(deduped.map(s => s.ideaId)))
    } catch { localStorage.removeItem('tripSelections') }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { if (ideas.length > 0) ideasLoaded.current = true }, [ideas])

  useEffect(() => {
    localStorage.setItem('tripSelections', JSON.stringify(selections))
    localStorage.setItem('tripDate', tripDate)
    localStorage.setItem('secretMessage', secretMsg)
  }, [selections, tripDate, secretMsg])

  const handleToggle = useCallback((ideaId: string) => {
    if (!ideasLoaded.current) return
    const isCurrentlySelected = selectedIds.has(ideaId)
    if (isCurrentlySelected) {
      setSelectedIds(prev => { const n = new Set(prev); n.delete(ideaId); return n })
      setSelections(prev => prev.filter(s => s.ideaId !== ideaId))
    } else {
      const idea = ideas.find(i => i.id === ideaId)
      if (!idea) return
      setSelectedIds(prev => { const n = new Set(prev); n.add(ideaId); return n })
      setSelections(prev => {
        if (prev.some(s => s.ideaId === ideaId)) return prev
        return [...prev, { ideaId: idea.id, name: idea.idea_name, cat: idea.category_name || '', subtype: idea.subtype_name || '' }]
      })
    }
  }, [ideas, selectedIds])

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

  const detailIdea  = detailIdeaId  ? ideas.find(i => i.id === detailIdeaId)  : null
  const editLocIdea = editLocIdeaId ? ideas.find(i => i.id === editLocIdeaId) : null
  const canGenerate = tripDate && selections.length > 0

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

      {/* Modals */}
      {detailIdea && (
        <IdeaDetailModal
          idea={detailIdea} reviews={detailReviews}
          rating={ideaRatings[detailIdea.id]} tripDates={tripDates}
          onClose={() => setDetailIdeaId(null)}
          onEditInfo={(id) => { setDetailIdeaId(null); setEditLocIdeaId(id) }}
          onReviewSaved={() => { loadReviews(); handleViewDetail(detailIdea.id) }}
        />
      )}

      {editLocIdea && (
        <EditLocationModal
          idea={editLocIdea}
          onClose={() => setEditLocIdeaId(null)}
          onSaved={() => { loadAllData(); setEditLocIdeaId(null) }}
        />
      )}

      {showAdd && (
        <AddIdeaModal
          categories={categories}
          cities={cities}
          onClose={() => setShowAdd(false)}
          onSaved={() => { loadAllData(); setShowAdd(false) }}
          onToast={(msg, type) => setToast({ msg, type })}
        />
      )}
    </div>
  )
}