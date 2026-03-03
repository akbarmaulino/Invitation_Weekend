'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { formatTanggalIndonesia, getPublicImageUrl, getPublicVideoUrl, uploadImages, uploadVideo } from '@/lib/utils'
import { useData } from '@/context/DataContext'
import type { TripHistory, IdeaReview, TripSelection } from '@/types/types'

const P = '#03254c', S = '#c4e8ff', BG = '#d0efff', BGM = '#e1f3ff', MUTED = '#a0a0b5'
const inp: React.CSSProperties = { width: '100%', padding: '9px 13px', border: `2px solid ${S}`, borderRadius: 10, fontSize: '0.9em', color: P, background: 'white', outline: 'none', boxSizing: 'border-box' }

type Mode = 'view' | 'edit'

interface Props {
  trip: TripHistory
  reviews: IdeaReview[]
  onClose: () => void
  onDelete: () => void
  onReviewSaved: () => void
  onTripUpdated: (t: TripHistory) => void
}

export default function TripDetailModal({ trip, reviews, onClose, onDelete, onReviewSaved, onTripUpdated }: Props) {
  const { ideas } = useData()
  const [mode, setMode] = useState<Mode>('view')

  // Edit state — only active in edit mode
  const [editActs, setEditActs]   = useState<TripSelection[]>(trip.selection_json || [])
  const [editDate, setEditDate]   = useState(trip.trip_date)
  const [editMsg, setEditMsg]     = useState(trip.secret_message || '')
  const [ideaSearch, setIdeaSearch] = useState('')
  const [saving, setSaving]       = useState(false)
  const [saveStatus, setSaveStatus] = useState('')

  // Review state — only active in view mode
  const [reviewingId, setReviewingId] = useState<string|null>(null)
  const [rvRating, setRvRating]   = useState(0)
  const [rvText, setRvText]       = useState('')
  const [rvName, setRvName]       = useState(() => typeof window !== 'undefined' ? localStorage.getItem('lastReviewerName')||'' : '')
  const [photos, setPhotos]       = useState<FileList|null>(null)
  const [video, setVideo]         = useState<File|null>(null)
  const [rvSaving, setRvSaving]   = useState(false)
  const [rvStatus, setRvStatus]   = useState('')

  // Only reviews for THIS trip
  const reviewsByIdea = useMemo(() => {
    const map: Record<string, IdeaReview[]> = {}
    reviews
      .filter(r => r.trip_id === trip.id)
      .forEach(r => {
        if (!r.idea_id) return
        if (!map[r.idea_id]) map[r.idea_id] = []
        map[r.idea_id].push(r)
      })
    return map
  }, [reviews, trip.id])

  const hasChanges = JSON.stringify(editActs) !== JSON.stringify(trip.selection_json||[]) || editDate !== trip.trip_date || editMsg !== (trip.secret_message||'')

  // Search ideas for edit mode
  const searchResults = useMemo(() => {
    if (!ideaSearch.trim()) return []
    const q = ideaSearch.toLowerCase()
    return ideas.filter(i => i.idea_name?.toLowerCase().includes(q) || i.category_name?.toLowerCase().includes(q)).slice(0, 6)
  }, [ideas, ideaSearch])

  const alreadyAdded = new Set(editActs.map(a => a.idea_id).filter(Boolean))

  function addIdea(idea: typeof ideas[0]) {
    if (alreadyAdded.has(idea.id)) return
    setEditActs(prev => [...prev, { idea_id: idea.id, name: idea.idea_name, category: idea.category_name||'', subtype: idea.subtype_name||'' }])
    setIdeaSearch('')
  }

  async function handleSave() {
    if (editActs.length === 0) return setSaveStatus('⚠️ Minimal 1 aktivitas!')
    setSaving(true); setSaveStatus('⏳ Menyimpan...')
    const day = new Date(editDate+'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long' })
    const { data, error } = await supabase.from('trip_history').update({ trip_date: editDate, trip_day: day, selection_json: editActs, secret_message: editMsg||null }).eq('id', trip.id).select().single()
    setSaving(false)
    if (error) { setSaveStatus('❌ Gagal menyimpan'); return }
    setSaveStatus('✅ Tersimpan!')
    onTripUpdated(data as TripHistory)
    setTimeout(() => { setSaveStatus(''); setMode('view') }, 1200)
  }

  function openReview(ideaId: string) {
    const ex = reviewsByIdea[ideaId]?.[0]
    setReviewingId(ideaId)
    setRvRating(ex?.rating || 0)
    setRvText(ex?.review_text || '')
    setRvName(ex?.reviewer_name || localStorage.getItem('lastReviewerName') || '')
    setRvStatus(''); setPhotos(null); setVideo(null)
  }

  async function handleSaveReview() {
    if (!reviewingId) return
    if (rvRating === 0) return setRvStatus('⚠️ Beri minimal 1 bintang!')
    if (!rvName.trim()) return setRvStatus('⚠️ Masukkan nama kamu!')
    setRvSaving(true); setRvStatus('⏳ Menyimpan...')
    let photoUrls: string[] = []
    if (photos?.length) photoUrls = await uploadImages(photos, 'anon', 'review')
    let videoUrl: string|null = null
    if (video) { setRvStatus('🎬 Upload video...'); videoUrl = await uploadVideo(video, 'anon', 'review'); if (!videoUrl) { setRvStatus('❌ Gagal upload video'); setRvSaving(false); return } }
    const payload = { idea_id: reviewingId, trip_id: trip.id, user_id: 'anon', reviewer_name: rvName.trim(), rating: rvRating, review_text: rvText||null, photo_url: photoUrls.length ? photoUrls : null, video_url: videoUrl }
    const ex = reviewsByIdea[reviewingId]?.[0]
    const { error } = ex ? await supabase.from('idea_reviews').update(payload).eq('id', ex.id) : await supabase.from('idea_reviews').insert([payload])
    setRvSaving(false)
    if (error) { setRvStatus('❌ Gagal menyimpan'); return }
    localStorage.setItem('lastReviewerName', rvName.trim())
    setRvStatus('✅ Tersimpan!'); setReviewingId(null); onReviewSaved()
  }

  // ─── SHARED HEADER ─────────────────────────────────────────────────────────
  const Header = () => (
    <div style={{ padding: '18px 24px', borderBottom: `2px solid ${S}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <h3 style={{ fontWeight: 800, color: P, margin: '0 0 3px', fontSize: '1.05em' }}>
          {mode === 'view' ? '🔍' : '✏️'} {trip.trip_day}, {formatTanggalIndonesia(trip.trip_date)}
        </h3>
        <p style={{ margin: 0, fontSize: '0.78em', color: MUTED }}>
          {(mode === 'view' ? trip.selection_json : editActs)?.length || 0} aktivitas
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* Mode toggle */}
        <div style={{ display: 'flex', background: BGM, borderRadius: 10, padding: 3, border: `1.5px solid ${S}` }}>
          {(['view', 'edit'] as Mode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); setReviewingId(null) }} style={{ padding: '5px 14px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: '0.82em', cursor: 'pointer', background: mode === m ? P : 'transparent', color: mode === m ? 'white' : MUTED, transition: 'all 0.15s' }}>
              {m === 'view' ? '👁️ Lihat' : '✏️ Edit'}
            </button>
          ))}
        </div>
        <button onClick={onDelete} style={{ padding: '6px 10px', borderRadius: 10, background: '#fff1f2', color: '#f43f5e', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.85em' }}>🗑️</button>
        <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 10, background: BGM, color: P, border: 'none', cursor: 'pointer', fontSize: '1em' }}>✕</button>
      </div>
    </div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(3,37,76,0.4)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 16px', overflowY: 'auto' }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: 'white', borderRadius: 24, border: `2px solid ${S}`, boxShadow: '0 16px 48px rgba(3,37,76,0.18)', width: '100%', maxWidth: 680, margin: 'auto' }}>
        <Header />

        {/* ── VIEW MODE ─────────────────────────────────────────────────── */}
        {mode === 'view' && (
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Secret message */}
            {trip.secret_message && (
              <div style={{ padding: '10px 16px', borderRadius: 12, background: '#fffbeb', border: '1.5px solid #fcd34d', fontSize: '0.88em', color: '#92400e', fontStyle: 'italic' }}>
                💌 {trip.secret_message}
              </div>
            )}

            {/* Activities + reviews */}
            {(trip.selection_json||[]).map((act, i) => {
              const actReviews = act.idea_id ? (reviewsByIdea[act.idea_id] || []) : []
              const hasReview = actReviews.length > 0
              const isReviewing = reviewingId === act.idea_id

              return (
                <div key={i} style={{ borderRadius: 14, border: `2px solid ${hasReview ? S : '#e5e7eb'}`, background: hasReview ? BGM : 'white', overflow: 'hidden' }}>
                  {/* Activity row */}
                  <div style={{ display: 'flex', alignItems: 'center', padding: '11px 14px', gap: 10 }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: hasReview ? P : '#e5e7eb', color: hasReview ? 'white' : MUTED, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72em', fontWeight: 800, flexShrink: 0 }}>{hasReview ? '✓' : i+1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, color: P, fontSize: '0.9em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.name}</p>
                      <p style={{ margin: 0, fontSize: '0.75em', color: MUTED }}>{act.category} · {act.subtype}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                      {hasReview && <span style={{ color: '#f59e0b', fontSize: '0.85em' }}>{'★'.repeat(actReviews[0].rating||0)}</span>}
                      {act.idea_id && (
                        <button onClick={() => isReviewing ? setReviewingId(null) : openReview(act.idea_id!)} style={{ padding: '4px 12px', borderRadius: 8, background: isReviewing ? '#fff1f2' : hasReview ? BGM : P, color: isReviewing ? '#f43f5e' : hasReview ? P : 'white', border: `1.5px solid ${isReviewing ? '#fda4af' : S}`, fontWeight: 700, cursor: 'pointer', fontSize: '0.78em' }}>
                          {isReviewing ? '✕ Tutup' : hasReview ? '✏️ Edit Review' : '+ Review'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Existing reviews (collapsed if reviewing) */}
                  {!isReviewing && hasReview && (
                    <div style={{ padding: '0 14px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {actReviews.map(rv => {
                        const pics = Array.isArray(rv.photo_url) ? rv.photo_url : rv.photo_url ? [rv.photo_url] : []
                        const vurl = getPublicVideoUrl(rv.video_url)
                        return (
                          <div key={rv.id} style={{ background: 'white', borderRadius: 10, padding: '8px 12px', border: `1px solid ${S}` }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: rv.review_text ? 6 : 0 }}>
                              {rv.reviewer_name && <span style={{ padding: '2px 10px', borderRadius: 999, background: BGM, color: P, fontSize: '0.78em', fontWeight: 700 }}>👤 {rv.reviewer_name}</span>}
                              <span style={{ color: '#f59e0b', fontSize: '0.88em' }}>{'★'.repeat(rv.rating||0)}</span>
                            </div>
                            {rv.review_text && <p style={{ margin: 0, fontSize: '0.83em', color: P, fontStyle: 'italic' }}>"{rv.review_text}"</p>}
                            {pics.length > 0 && <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>{pics.map((url,pi) => <div key={pi} style={{ position: 'relative', width: 60, height: 60, borderRadius: 8, overflow: 'hidden', border: `1.5px solid ${S}` }}><Image src={getPublicImageUrl(url)} alt="foto" fill style={{ objectFit: 'cover' }} unoptimized /></div>)}</div>}
                            {vurl && <video src={vurl} controls style={{ width: '100%', maxWidth: 260, borderRadius: 8, marginTop: 6 }} />}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Review form */}
                  {isReviewing && (
                    <div style={{ padding: '12px 14px 14px', borderTop: `1px solid ${S}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div><label style={{ fontSize: '0.77em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 5 }}>Nama</label><input value={rvName} onChange={e => setRvName(e.target.value)} style={inp} /></div>
                        <div><label style={{ fontSize: '0.77em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 5 }}>Rating</label><div style={{ display: 'flex', gap: 3, paddingTop: 4 }}>{[1,2,3,4,5].map(s => <span key={s} onClick={() => setRvRating(s)} style={{ fontSize: '1.5em', cursor: 'pointer', color: s<=rvRating ? '#f59e0b' : '#e5e7eb' }}>★</span>)}</div></div>
                      </div>
                      <div><label style={{ fontSize: '0.77em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 5 }}>Ulasan</label><textarea value={rvText} onChange={e => setRvText(e.target.value)} rows={2} placeholder="Gimana pengalamannya?" style={{ ...inp, resize: 'vertical' }} /></div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div><label style={{ fontSize: '0.77em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 5 }}>📷 Foto</label><input type="file" accept="image/*" multiple onChange={e => setPhotos(e.target.files)} style={{ fontSize: '0.8em' }} /></div>
                        <div><label style={{ fontSize: '0.77em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 5 }}>🎬 Video</label><input type="file" accept="video/*" onChange={e => setVideo(e.target.files?.[0]||null)} style={{ fontSize: '0.8em' }} /></div>
                      </div>
                      {rvStatus && <p style={{ margin: 0, fontSize: '0.83em', fontWeight: 700, color: rvStatus.startsWith('❌') ? '#f43f5e' : P }}>{rvStatus}</p>}
                      <button onClick={handleSaveReview} disabled={rvSaving} style={{ padding: '10px', borderRadius: 12, background: rvSaving ? '#e5e7eb' : `linear-gradient(135deg, ${P}, #1a4d7a)`, color: 'white', border: 'none', fontWeight: 800, cursor: rvSaving ? 'not-allowed' : 'pointer' }}>{rvSaving ? '⏳ Menyimpan...' : '💾 Simpan Review'}</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── EDIT MODE ─────────────────────────────────────────────────── */}
        {mode === 'edit' && (
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Edit date + message */}
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: '0.77em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 5 }}>Tanggal</label>
                <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} style={{ ...inp, width: 'fit-content' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.77em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 5 }}>💌 Pesan Rahasia</label>
                <input value={editMsg} onChange={e => setEditMsg(e.target.value)} placeholder="Tulis pesan..." style={inp} />
              </div>
            </div>

            {/* Search to add idea */}
            <div style={{ position: 'relative' }}>
              <label style={{ fontSize: '0.77em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 5 }}>🔍 Tambah Aktivitas</label>
              <input value={ideaSearch} onChange={e => setIdeaSearch(e.target.value)} placeholder="Cari tempat untuk ditambahkan..." style={inp} />
              {searchResults.length > 0 && (
                <div style={{ position: 'absolute', left: 0, right: 0, zIndex: 10, background: 'white', border: `2px solid ${S}`, borderRadius: 12, boxShadow: '0 8px 24px rgba(3,37,76,0.12)', maxHeight: 200, overflowY: 'auto', marginTop: 4 }}>
                  {searchResults.map(idea => {
                    const added = alreadyAdded.has(idea.id)
                    return (
                      <div key={idea.id} onClick={() => !added && addIdea(idea)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', cursor: added ? 'default' : 'pointer', opacity: added ? 0.5 : 1, borderBottom: `1px solid ${BGM}` }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88em', color: P }}>{idea.idea_name}</p>
                          <p style={{ margin: 0, fontSize: '0.75em', color: MUTED }}>{idea.category_name} · {idea.subtype_name}</p>
                        </div>
                        <span style={{ fontSize: '0.78em', fontWeight: 700, color: added ? MUTED : P }}>{added ? '✓ Ada' : '+ Tambah'}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Editable activities list */}
            {editActs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', border: `2px dashed ${S}`, borderRadius: 12, color: MUTED, fontSize: '0.9em' }}>Cari tempat di atas untuk ditambahkan</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {editActs.map((act, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: BGM, border: `1.5px solid ${S}` }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: P, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7em', fontWeight: 800, flexShrink: 0 }}>{i+1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, color: P, fontSize: '0.88em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.name}</p>
                      <p style={{ margin: 0, fontSize: '0.73em', color: MUTED }}>{act.category} · {act.subtype}</p>
                    </div>
                    <button onClick={() => setEditActs(prev => prev.filter((_,idx) => idx !== i))} style={{ padding: '4px 10px', borderRadius: 8, background: '#fff1f2', color: '#f43f5e', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '0.82em' }}>✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Save */}
            {saveStatus && <p style={{ margin: 0, fontSize: '0.85em', fontWeight: 700, color: saveStatus.startsWith('❌') ? '#f43f5e' : saveStatus.startsWith('✅') ? '#065f46' : P }}>{saveStatus}</p>}
            <button onClick={handleSave} disabled={saving || !hasChanges} style={{ padding: '12px', borderRadius: 12, background: saving || !hasChanges ? '#e5e7eb' : `linear-gradient(135deg, ${P}, #1a4d7a)`, color: saving || !hasChanges ? MUTED : 'white', border: 'none', fontWeight: 800, cursor: saving || !hasChanges ? 'not-allowed' : 'pointer', fontSize: '0.95em' }}>
              {saving ? '⏳ Menyimpan...' : hasChanges ? '💾 Simpan Perubahan' : '✓ Tidak ada perubahan'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}