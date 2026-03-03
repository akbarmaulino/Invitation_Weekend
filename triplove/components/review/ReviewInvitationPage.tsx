'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { dbQuery, logger } from '@/lib/logger'
import { validateInvitationToken, incrementInvitationUse, uploadImages, uploadVideo, formatTanggalIndonesia } from '@/lib/utils'
import Toast from '@/components/ui/Toast'
import type { TripHistory, TripInvitation, TripSelection } from '@/types/types'

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

  const [pageState, setPageState] = useState<PageState>('loading')
  const [errorMsg, setErrorMsg]   = useState('')
  const [trip, setTrip]           = useState<TripHistory | null>(null)
  const [invitation, setInvitation] = useState<TripInvitation | null>(null)
  const [reviewerName, setReviewerName] = useState('')
  const [entries, setEntries]     = useState<ReviewEntry[]>([])
  const [progress, setProgress]   = useState(0)
  const [toast, setToast]         = useState<{ message: string; type: 'success'|'error'|'info'|'warn' } | null>(null)

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

    // Build review entries from trip selections
    const selections: TripSelection[] = (result.trip as TripHistory).selection_json || []
    setEntries(selections.filter(s => s.idea_id).map(s => ({
      ideaId:   s.idea_id!,
      name:     s.name,
      category: s.category,
      subtype:  s.subtype,
      rating:   0,
      text:     '',
      photos:   null,
      video:    null,
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

    setPageState('submitting')
    setProgress(0)

    try {
      for (let i = 0; i < rated.length; i++) {
        const e = rated[i]
        setProgress(Math.round(((i) / rated.length) * 100))

        let photoUrls: string[] = []
        if (e.photos?.length) photoUrls = await uploadImages(e.photos, 'anon', 'review-invite')

        let videoUrl: string | null = null
        if (e.video) videoUrl = await uploadVideo(e.video, 'anon', 'review-invite')

        const payload = {
          idea_id:       e.ideaId,
          trip_id:       trip!.id,
          user_id:       'anon',
          reviewer_name: reviewerName.trim(),
          rating:        e.rating,
          review_text:   e.text || null,
          photo_url:     photoUrls.length ? photoUrls : null,
          video_url:     videoUrl,
        }

        // Check if review already exists from this reviewer for this idea
        const { data: existing } = await supabase.from('idea_reviews').select('id')
          .eq('idea_id', e.ideaId).eq('reviewer_name', reviewerName.trim()).maybeSingle()

        if (existing) {
          await dbQuery(`idea_reviews → UPDATE (${e.name})`, () =>
            supabase.from('idea_reviews').update(payload).eq('id', existing.id)
          )
        } else {
          await dbQuery(`idea_reviews → INSERT (${e.name})`, () =>
            supabase.from('idea_reviews').insert([payload])
          )
        }

        setProgress(Math.round(((i + 1) / rated.length) * 100))
      }

      // Mark invitation as used
      if (invitation) await incrementInvitationUse(invitation.id)

      logger.success('ReviewPage', `${rated.length} reviews submitted!`)
      setPageState('done')
    } catch (err) {
      logger.error('ReviewPage', (err as Error)?.message || String(err))
      setToast({ message: 'Ada yang gagal. Coba lagi.', type: 'error' })
      setPageState('ready')
    }
  }

  // ── Render states ──────────────────────────────────────────

  if (pageState === 'loading') return (
    <div className="loading-container" style={{ minHeight: '100vh' }}>
      <div className="loader" />
      <p style={{ color: 'var(--color-muted)' }}>Memvalidasi link...</p>
    </div>
  )

  if (pageState === 'invalid') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--color-background-light), var(--color-background-medium))' }}>
      <div className="card" style={{ maxWidth: 420, textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: '4em', marginBottom: 16 }}>😕</div>
        <h2 style={{ color: 'var(--color-primary)', marginBottom: 12 }}>Link Tidak Valid</h2>
        <p style={{ color: 'var(--color-muted)', marginBottom: 24 }}>{errorMsg}</p>
        <p style={{ fontSize: '0.85em', color: 'var(--color-muted)' }}>Link mungkin sudah expired atau sudah digunakan. Minta link baru dari pasanganmu.</p>
      </div>
    </div>
  )

  if (pageState === 'done') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--color-background-light), var(--color-background-medium))' }}>
      <div className="card" style={{ maxWidth: 420, textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: '4em', marginBottom: 16 }}>🎉</div>
        <h2 style={{ color: 'var(--color-primary)', marginBottom: 12 }}>Review Tersimpan!</h2>
        <p style={{ color: 'var(--color-muted)' }}>Terima kasih {reviewerName}! Review kamu sudah masuk ❤️</p>
      </div>
    </div>
  )

  if (pageState === 'submitting') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--color-background-light), var(--color-background-medium))' }}>
      <div className="card" style={{ maxWidth: 420, textAlign: 'center', padding: 40 }}>
        <div className="loader" style={{ margin: '0 auto 20px' }} />
        <h3 style={{ color: 'var(--color-primary)', marginBottom: 12 }}>Menyimpan review...</h3>
        <div className="progress-bar-container" style={{ marginBottom: 8 }}>
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.85em' }}>{progress}%</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, var(--color-background-light) 0%, var(--color-background-medium) 100%)', padding: '24px 16px' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Header card */}
        <div className="card" style={{ textAlign: 'center', marginBottom: 24, background: 'linear-gradient(135deg, var(--color-background-medium), var(--color-secondary))' }}>
          <h1 style={{ color: 'var(--color-primary)', fontSize: '1.6em', fontWeight: 900, margin: '0 0 8px' }}>
            Review Trip ❤️
          </h1>
          <p style={{ color: 'var(--color-primary)', opacity: 0.7, margin: '0 0 16px', fontSize: '0.95em' }}>
            {invitation?.inviter_name} mengundang kamu untuk review trip ini
          </p>
          {trip && (
            <div style={{ display: 'inline-flex', gap: 16, background: 'white', borderRadius: 12, padding: '10px 20px' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.95em' }}>
                📅 {trip.trip_day}, {formatTanggalIndonesia(trip.trip_date)}
              </span>
              <span style={{ color: 'var(--color-muted)', fontSize: '0.9em' }}>
                {entries.length} tempat
              </span>
            </div>
          )}
        </div>

        {/* Reviewer name */}
        <div className="card" style={{ marginBottom: 20 }}>
          <label style={{ fontSize: '0.85em', fontWeight: 700, color: 'var(--color-muted)', display: 'block', marginBottom: 8 }}>
            Nama Kamu *
          </label>
          <input
            value={reviewerName} onChange={e => setReviewerName(e.target.value)}
            placeholder="misal: Ciaaa atau Lino"
            className="input-base"
            style={{ fontSize: '1em' }}
          />
        </div>

        {/* Review entries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          {entries.map(entry => (
            <div key={entry.ideaId} className="card" style={{ borderLeft: `4px solid ${entry.rating > 0 ? 'var(--color-primary)' : '#e0e0e0'}` }}>
              <div style={{ marginBottom: 14 }}>
                <h3 style={{ color: 'var(--color-primary)', margin: '0 0 4px', fontWeight: 700 }}>{entry.name}</h3>
                <p style={{ color: 'var(--color-muted)', margin: 0, fontSize: '0.82em' }}>{entry.category} · {entry.subtype}</p>
              </div>

              {/* Stars */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: '0.8em', fontWeight: 600, color: 'var(--color-muted)', display: 'block', marginBottom: 6 }}>Rating</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1,2,3,4,5].map(s => (
                    <span
                      key={s}
                      onClick={() => updateEntry(entry.ideaId, 'rating', entry.rating === s ? 0 : s)}
                      style={{ fontSize: '1.8em', cursor: 'pointer', color: s <= entry.rating ? 'gold' : '#ddd', transition: 'color 0.1s' }}
                    >★</span>
                  ))}
                  {entry.rating > 0 && <span style={{ alignSelf: 'center', fontSize: '0.85em', color: 'var(--color-muted)', marginLeft: 4 }}>{entry.rating}/5</span>}
                </div>
              </div>

              {entry.rating > 0 && (
                <>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: '0.8em', fontWeight: 600, color: 'var(--color-muted)', display: 'block', marginBottom: 6 }}>Ulasan (Opsional)</label>
                    <textarea
                      value={entry.text}
                      onChange={e => updateEntry(entry.ideaId, 'text', e.target.value)}
                      placeholder="Gimana pengalamannya di sana?"
                      rows={2}
                      className="input-base"
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: '0.78em', fontWeight: 600, color: 'var(--color-muted)', display: 'block', marginBottom: 5 }}>📷 Foto</label>
                      <input type="file" accept="image/*" multiple onChange={e => updateEntry(entry.ideaId, 'photos', e.target.files)} style={{ fontSize: '0.8em' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78em', fontWeight: 600, color: 'var(--color-muted)', display: 'block', marginBottom: 5 }}>🎬 Video</label>
                      <input type="file" accept="video/*" onChange={e => updateEntry(entry.ideaId, 'video', e.target.files?.[0] || null)} style={{ fontSize: '0.8em' }} />
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          className="btn-primary"
          onClick={handleSubmit}
          style={{ width: '100%', padding: '16px', fontSize: '1em' }}
        >
          💾 Kirim Semua Review ({entries.filter(e => e.rating > 0).length}/{entries.length} dinilai)
        </button>

        <p style={{ textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.8em', marginTop: 12 }}>
          Link ini valid hingga {invitation ? new Date(invitation.expires_at).toLocaleDateString('id-ID') : '—'}
        </p>
      </div>
    </div>
  )
}