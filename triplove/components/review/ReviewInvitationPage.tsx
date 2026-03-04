'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { dbQuery, logger } from '@/lib/logger'
import { validateInvitationToken, incrementInvitationUse, uploadImages, uploadVideo, formatTanggalIndonesia } from '@/lib/utils'
import Toast from '@/components/ui/Toast'
import type { TripHistory, TripInvitation, TripSelection } from '@/types/types'

// ─── Inline design tokens (no CSS variables — page is accessed without layout) ──
const C = {
  primary:  '#03254c',
  secondary:'#c4e8ff',
  bg:       '#d0efff',
  bgMedium: '#e1f3ff',
  muted:    '#a0a0b5',
  white:    '#ffffff',
}

type PageState = 'loading' | 'invalid' | 'ready' | 'submitting' | 'done'

interface ReviewEntry {
  ideaId: string
  name: string
  category: string
  subtype: string
  rating: number
  text: string
  photos: FileList | null
  video: File | null
}

export default function ReviewInvitationPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [pageState, setPageState]     = useState<PageState>('loading')
  const [errorMsg, setErrorMsg]       = useState('')
  const [trip, setTrip]               = useState<TripHistory | null>(null)
  const [invitation, setInvitation]   = useState<TripInvitation | null>(null)
  const [reviewerName, setReviewerName] = useState('')
  const [entries, setEntries]         = useState<ReviewEntry[]>([])
  const [progress, setProgress]       = useState(0)
  const [toast, setToast]             = useState<{ message: string; type: 'success'|'error'|'info'|'warn' } | null>(null)

  useEffect(() => {
    if (!token) { setErrorMsg('Token tidak ditemukan di URL.'); setPageState('invalid'); return }
    validateToken(token)
  }, [token])

  async function validateToken(t: string) {
    logger.info('ReviewPage', `Validating token: ${t}`)
    const result = await validateInvitationToken(t)
    if (!result.valid) {
      logger.error('ReviewPage', result.error || 'Invalid token')
      setErrorMsg(result.error || 'Link tidak valid.')
      setPageState('invalid')
      return
    }
    setTrip(result.trip as TripHistory)
    setInvitation(result.invitation as TripInvitation)
    const selections: TripSelection[] = (result.trip as TripHistory).selection_json || []
    setEntries(selections.filter(s => s.idea_id).map(s => ({
      ideaId: s.idea_id!, name: s.name, category: s.category, subtype: s.subtype,
      rating: 0, text: '', photos: null, video: null,
    })))
    setPageState('ready')
    logger.success('ReviewPage', `Token valid. Trip: ${(result.trip as TripHistory).trip_date}, ${selections.length} activities`)
  }

  function updateEntry(ideaId: string, field: keyof ReviewEntry, value: any) {
    setEntries(prev => prev.map(e => e.ideaId === ideaId ? { ...e, [field]: value } : e))
  }

  async function handleSubmit() {
    if (!reviewerName.trim()) return setToast({ message: 'Masukkan nama kamu dulu!', type: 'warn' })
    const rated = entries.filter(e => e.rating > 0)
    if (rated.length === 0) return setToast({ message: 'Beri rating minimal 1 tempat!', type: 'warn' })
    setPageState('submitting'); setProgress(0)
    try {
      for (let i = 0; i < rated.length; i++) {
        const e = rated[i]
        setProgress(Math.round((i / rated.length) * 100))
        let photoUrls: string[] = []
        if (e.photos?.length) photoUrls = await uploadImages(e.photos, 'anon', 'review-invite')
        let videoUrl: string | null = null
        if (e.video) videoUrl = await uploadVideo(e.video, 'anon', 'review-invite')
        const payload = {
          idea_id: e.ideaId, trip_id: trip!.id, user_id: 'anon',
          reviewer_name: reviewerName.trim(), rating: e.rating,
          review_text: e.text || null,
          photo_url: photoUrls.length ? photoUrls : null, video_url: videoUrl,
        }
        const { data: existing } = await supabase.from('idea_reviews').select('id')
          .eq('idea_id', e.ideaId).eq('reviewer_name', reviewerName.trim()).maybeSingle()
        if (existing) {
          await dbQuery(`idea_reviews → UPDATE (${e.name})`, () =>
            supabase.from('idea_reviews').update(payload).eq('id', existing.id))
        } else {
          await dbQuery(`idea_reviews → INSERT (${e.name})`, () =>
            supabase.from('idea_reviews').insert([payload]))
        }
        setProgress(Math.round(((i + 1) / rated.length) * 100))
      }
      if (invitation) await incrementInvitationUse(invitation.id)
      logger.success('ReviewPage', `${rated.length} reviews submitted!`)
      setPageState('done')
    } catch (err) {
      logger.error('ReviewPage', (err as Error)?.message || String(err))
      setToast({ message: 'Ada yang gagal. Coba lagi.', type: 'error' })
      setPageState('ready')
    }
  }

  // ── Shared wrapper style ──────────────────────────────────────────────────
  const pageWrap: React.CSSProperties = {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${C.bg} 0%, ${C.bgMedium} 100%)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Inter', -apple-system, sans-serif",
    padding: 20,
  }
  const card: React.CSSProperties = {
    background: C.white, borderRadius: 20,
    boxShadow: '0 4px 24px rgba(3,37,76,0.1)',
    padding: 32,
  }

  if (pageState === 'loading') return (
    <div style={{ ...pageWrap, flexDirection: 'column', gap: 16 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 36, height: 36, border: '3px solid #e0e0e0', borderTopColor: C.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: C.muted, margin: 0, fontSize: '0.9em' }}>Memvalidasi link...</p>
    </div>
  )

  if (pageState === 'invalid') return (
    <div style={pageWrap}>
      <div style={{ ...card, maxWidth: 420, textAlign: 'center' }}>
        <div style={{ fontSize: '3.5em', marginBottom: 14 }}>😕</div>
        <h2 style={{ color: C.primary, marginBottom: 10, fontWeight: 800 }}>Link Tidak Valid</h2>
        <p style={{ color: C.muted, marginBottom: 16, lineHeight: 1.5 }}>{errorMsg}</p>
        <p style={{ fontSize: '0.83em', color: C.muted, lineHeight: 1.5 }}>Link mungkin sudah expired atau sudah digunakan. Minta link baru dari pasanganmu.</p>
      </div>
    </div>
  )

  if (pageState === 'done') return (
    <div style={pageWrap}>
      <div style={{ ...card, maxWidth: 420, textAlign: 'center' }}>
        <div style={{ fontSize: '3.5em', marginBottom: 14 }}>🎉</div>
        <h2 style={{ color: C.primary, marginBottom: 10, fontWeight: 800 }}>Review Tersimpan!</h2>
        <p style={{ color: C.muted, lineHeight: 1.5 }}>Terima kasih {reviewerName}! Review kamu sudah masuk ❤️</p>
      </div>
    </div>
  )

  if (pageState === 'submitting') return (
    <div style={pageWrap}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ ...card, maxWidth: 420, textAlign: 'center', width: '100%' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e0e0e0', borderTopColor: C.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 18px' }} />
        <h3 style={{ color: C.primary, marginBottom: 14, fontWeight: 700 }}>Menyimpan review...</h3>
        <div style={{ background: '#f0f0f0', borderRadius: 999, height: 8, marginBottom: 8, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: C.primary, borderRadius: 999, transition: 'width .3s' }} />
        </div>
        <p style={{ color: C.muted, fontSize: '0.85em', margin: 0 }}>{progress}%</p>
      </div>
    </div>
  )

  // ── MAIN FORM ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${C.bg} 0%, ${C.bgMedium} 100%)`, padding: '24px 16px', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        input, textarea { font-family: inherit; box-sizing: border-box; }
        input:focus, textarea:focus { outline: 2px solid ${C.primary}; outline-offset: 2px; }
      `}</style>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ ...card, textAlign: 'center', marginBottom: 20, background: `linear-gradient(135deg, ${C.bgMedium}, ${C.secondary})` }}>
          <h1 style={{ color: C.primary, fontSize: '1.6em', fontWeight: 900, margin: '0 0 8px' }}>Review Trip ❤️</h1>
          <p style={{ color: C.primary, opacity: 0.7, margin: '0 0 16px', fontSize: '0.93em' }}>
            {invitation?.inviter_name} mengundang kamu untuk review trip ini
          </p>
          {trip && (
            <div style={{ display: 'inline-flex', gap: 16, background: C.white, borderRadius: 12, padding: '10px 20px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ fontWeight: 700, color: C.primary, fontSize: '0.93em' }}>
                📅 {trip.trip_day}, {formatTanggalIndonesia(trip.trip_date)}
              </span>
              <span style={{ color: C.muted, fontSize: '0.88em' }}>{entries.length} tempat</span>
            </div>
          )}
        </div>

        {/* Reviewer name */}
        <div style={{ ...card, marginBottom: 16 }}>
          <label style={{ fontSize: '0.83em', fontWeight: 700, color: C.muted, display: 'block', marginBottom: 8 }}>
            Nama Kamu *
          </label>
          <input
            value={reviewerName}
            onChange={e => setReviewerName(e.target.value)}
            placeholder="misal: Ciaaa atau Lino"
            style={{ width: '100%', padding: '10px 14px', border: `2px solid ${C.secondary}`, borderRadius: 10, fontSize: '1em', color: C.primary, background: C.white }}
          />
        </div>

        {/* Review entries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          {entries.map(entry => (
            <div key={entry.ideaId} style={{ ...card, borderLeft: `4px solid ${entry.rating > 0 ? C.primary : '#e0e0e0'}`, padding: '20px 20px 20px 16px' }}>
              <div style={{ marginBottom: 12 }}>
                <h3 style={{ color: C.primary, margin: '0 0 4px', fontWeight: 700, fontSize: '1.05em' }}>{entry.name}</h3>
                <p style={{ color: C.muted, margin: 0, fontSize: '0.8em' }}>{entry.category} · {entry.subtype}</p>
              </div>

              {/* Stars */}
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: '0.78em', fontWeight: 600, color: C.muted, display: 'block', marginBottom: 6 }}>Rating</label>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} onClick={() => updateEntry(entry.ideaId, 'rating', entry.rating === s ? 0 : s)}
                      style={{ fontSize: '1.8em', cursor: 'pointer', color: s <= entry.rating ? '#f59e0b' : '#ddd', transition: 'color 0.1s', userSelect: 'none' }}>★</span>
                  ))}
                  {entry.rating > 0 && <span style={{ fontSize: '0.82em', color: C.muted, marginLeft: 4 }}>{entry.rating}/5</span>}
                </div>
              </div>

              {entry.rating > 0 && (
                <>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: '0.78em', fontWeight: 600, color: C.muted, display: 'block', marginBottom: 6 }}>Ulasan (Opsional)</label>
                    <textarea
                      value={entry.text}
                      onChange={e => updateEntry(entry.ideaId, 'text', e.target.value)}
                      placeholder="Gimana pengalamannya di sana?"
                      rows={2}
                      style={{ width: '100%', padding: '10px 14px', border: `2px solid ${C.secondary}`, borderRadius: 10, fontSize: '0.9em', color: C.primary, resize: 'vertical', background: C.white }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: '0.76em', fontWeight: 600, color: C.muted, display: 'block', marginBottom: 5 }}>📷 Foto</label>
                      <input type="file" accept="image/*" multiple onChange={e => updateEntry(entry.ideaId, 'photos', e.target.files)} style={{ fontSize: '0.78em', width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.76em', fontWeight: 600, color: C.muted, display: 'block', marginBottom: 5 }}>🎬 Video</label>
                      <input type="file" accept="video/*" onChange={e => updateEntry(entry.ideaId, 'video', e.target.files?.[0] || null)} style={{ fontSize: '0.78em', width: '100%' }} />
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          style={{
            width: '100%', padding: '15px', fontSize: '1em', fontWeight: 800,
            background: `linear-gradient(135deg, ${C.primary}, #1a4d7a)`,
            color: C.white, border: 'none', borderRadius: 14, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(3,37,76,0.25)', fontFamily: 'inherit',
            transition: 'all .15s',
          }}
        >
          💾 Kirim Semua Review ({entries.filter(e => e.rating > 0).length}/{entries.length} dinilai)
        </button>

        <p style={{ textAlign: 'center', color: C.muted, fontSize: '0.78em', marginTop: 12 }}>
          Link ini valid hingga {invitation ? new Date(invitation.expires_at).toLocaleDateString('id-ID') : '—'}
        </p>
      </div>
    </div>
  )
}