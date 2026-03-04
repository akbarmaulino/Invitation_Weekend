'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatTanggalIndonesia } from '@/lib/utils'
import Toast from '@/components/ui/Toast'
import type { LocalSelection } from '@/types/types'

const P = '#03254c', S = '#c4e8ff', BG = '#d0efff', BGM = '#e1f3ff', MUTED = '#a0a0b5'

export default function SummaryPage() {
  const router = useRouter()
  const ticketRef = useRef<HTMLDivElement>(null)

  const [selections, setSelections] = useState<LocalSelection[]>([])
  const [tripDate, setTripDate]     = useState('')
  const [secretMsg, setSecretMsg]   = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [editTripId, setEditTripId] = useState<string|null>(null)
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [toast, setToast]           = useState<{msg:string;type:any}|null>(null)

  useEffect(() => {
    const sels  = localStorage.getItem('tripSelections')
    const date  = localStorage.getItem('tripDate') || ''
    const msg   = localStorage.getItem('secretMessage') || ''
    const edit  = localStorage.getItem('editMode') === 'true'
    const tid   = localStorage.getItem('editTripId') || null

    if (!sels || !date) { router.push('/'); return }

    try {
      setSelections(JSON.parse(sels))
      setTripDate(date)
      setSecretMsg(msg)
      setIsEditMode(edit)
      setEditTripId(tid)
      if (!edit) setShowConfetti(true)
    } catch {
      router.push('/')
    }
  }, [])

  const tripDay = tripDate
    ? new Date(tripDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long' })
    : ''

  // Group by category
  const grouped = selections.reduce<Record<string, LocalSelection[]>>((acc, s) => {
    const key = s.cat || 'Lainnya'
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  async function handleSave() {
    setSaving(true)
    const payload = {
      trip_date:      tripDate,
      trip_day:       tripDay,
      selection_json: selections.map(s => ({ idea_id: s.ideaId, name: s.name, category: s.cat, subtype: s.subtype })),
      secret_message: secretMsg || null,
    }

    let error: any = null

    if (isEditMode && editTripId) {
      const res = await supabase.from('trip_history').update(payload).eq('id', editTripId)
      error = res.error
    } else {
      const res = await supabase.from('trip_history').insert([payload])
      error = res.error
    }

    setSaving(false)
    if (error) {
      setToast({ msg: 'Gagal menyimpan trip 😢', type: 'error' })
      return
    }

    // Clear localStorage
    localStorage.removeItem('tripSelections')
    localStorage.removeItem('tripDate')
    localStorage.removeItem('secretMessage')
    localStorage.removeItem('editMode')
    localStorage.removeItem('editTripId')

    setSaved(true)
    setToast({ msg: isEditMode ? 'Trip berhasil diupdate! 🎉' : 'Trip berhasil disimpan! 🎉', type: 'success' })
  }

  async function handleDownload() {
    if (!ticketRef.current) return
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(ticketRef.current, { scale: 2, backgroundColor: null, useCORS: true })
      const link = document.createElement('a')
      link.download = `triplove-${tripDate}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      setToast({ msg: 'Tiket berhasil didownload! 📥', type: 'success' })
    } catch {
      setToast({ msg: 'Gagal download, coba lagi', type: 'error' })
    }
  }

  async function handleShare() {
    if (!ticketRef.current) return
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(ticketRef.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
      canvas.toBlob(async (blob) => {
        if (!blob) return
        const file = new File([blob], `triplove-${tripDate}.png`, { type: 'image/png' })
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'TripLove 💕', text: `Trip ${tripDay}, ${formatTanggalIndonesia(tripDate)}` })
        } else {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url; link.download = `triplove-${tripDate}.png`; link.click()
          URL.revokeObjectURL(url)
          setToast({ msg: 'Tiket disimpan, share manual ya! 📸', type: 'info' })
        }
      }, 'image/png')
    } catch {
      setToast({ msg: 'Gagal share, coba download dulu', type: 'error' })
    }
  }

  if (!tripDate) return null

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${BG}, ${BGM})` }}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(208,239,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: `2px solid ${S}`, padding: '0 20px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: P, fontWeight: 700, cursor: 'pointer', fontSize: '0.9em', display: 'flex', alignItems: 'center', gap: 6 }}>← Kembali</button>
          <span style={{ fontWeight: 900, fontSize: '1.2em', color: P }}>TripLove 💕</span>
          <div style={{ width: 80 }} />
        </div>
      </header>

      <main style={{ maxWidth: 700, margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontWeight: 900, fontSize: '1.8em', color: P, margin: '0 0 8px' }}>
            {isEditMode ? '✏️ Update Trip' : '🎫 Tiket Trip Kalian!'}
          </h1>
          <p style={{ color: MUTED, margin: 0 }}>{isEditMode ? 'Review perubahan sebelum disimpan' : 'Simpan dan bagikan momen ini!'}</p>
        </div>

        {/* TICKET */}
        <div ref={ticketRef} style={{ width: '100%', maxWidth: 560 }}>
          <div style={{
            background: 'white',
            borderRadius: 28,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(3,37,76,0.18)',
            border: `3px solid ${S}`,
          }}>

            {/* Ticket header */}
            <div style={{ background: `linear-gradient(135deg, ${P} 0%, #1a4d7a 100%)`, padding: 'clamp(16px, 4vw, 28px) clamp(16px, 4vw, 32px)', color: 'white', position: 'relative', overflow: 'hidden' }}>
              {/* Decorative circles */}
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(196,232,255,0.1)' }} />
              <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(196,232,255,0.08)' }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: '1.6em' }}>💕</span>
                  <span style={{ fontWeight: 900, fontSize: '1.3em', letterSpacing: -0.5 }}>TripLove</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.78em', background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 999, fontWeight: 600 }}>BOARDING PASS</span>
                </div>
                <h2 style={{ fontWeight: 900, fontSize: '1.6em', margin: '0 0 4px', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                  {tripDay}
                </h2>
                <p style={{ margin: 0, fontSize: '1.1em', opacity: 0.85, fontWeight: 600 }}>
                  {formatTanggalIndonesia(tripDate)}
                </p>
              </div>
            </div>

            {/* Ticket tear line */}
            <div style={{ position: 'relative', height: 24, background: `linear-gradient(${P}, #1a4d7a)` }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 24, background: 'white', borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }} />
              {/* Notches */}
              <div style={{ position: 'absolute', bottom: 0, left: -14, width: 28, height: 28, borderRadius: '50%', background: BGM, border: `3px solid ${S}` }} />
              <div style={{ position: 'absolute', bottom: 0, right: -14, width: 28, height: 28, borderRadius: '50%', background: BGM, border: `3px solid ${S}` }} />
            </div>

            {/* Activities */}
            <div style={{ padding: 'clamp(12px, 3vw, 20px) clamp(16px, 4vw, 32px)' }}>
              <p style={{ fontSize: '0.72em', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 14px' }}>Itinerary · {selections.length} aktivitas</p>

              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat} style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: '0.75em', fontWeight: 800, color: P, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 16, height: 2, background: P, display: 'inline-block', borderRadius: 2 }} />
                    {cat}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {items.map((s, i) => (
                      <div key={s.ideaId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: BGM, border: `1.5px solid ${S}` }}>
                        <span style={{ width: 22, height: 22, borderRadius: '50%', background: P, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7em', fontWeight: 800, flexShrink: 0 }}>{i+1}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 700, color: P, fontSize: '0.88em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</p>
                          <p style={{ margin: 0, fontSize: '0.72em', color: MUTED }}>{s.subtype}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Secret message */}
            {secretMsg && (
              <>
                <div style={{ margin: '0 32px', height: 1, background: `linear-gradient(to right, transparent, ${S}, transparent)` }} />
                <div style={{ padding: '16px 32px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.3em', flexShrink: 0 }}>💌</span>
                  <p style={{ margin: 0, color: P, fontSize: '0.88em', fontStyle: 'italic', lineHeight: 1.6 }}>{secretMsg}</p>
                </div>
              </>
            )}

            {/* Ticket footer */}
            <div style={{ background: BGM, padding: 'clamp(10px, 2vw, 14px) clamp(16px, 4vw, 32px)', borderTop: `2px dashed ${S}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.7em', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5 }}>Generated by</p>
                <p style={{ margin: 0, fontWeight: 800, color: P, fontSize: '0.88em' }}>TripLove 💕</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '0.7em', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5 }}>Passengers</p>
                <p style={{ margin: 0, fontWeight: 800, color: P, fontSize: '0.88em' }}>2 ♥</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 560 }}>
          {!saved ? (
            <button onClick={handleSave} disabled={saving} style={{ padding: '14px', borderRadius: 999, background: saving ? '#a8d8f0' : `linear-gradient(135deg, ${P}, #1a4d7a)`, color: 'white', border: 'none', fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '1em', boxShadow: saving ? 'none' : '0 4px 16px rgba(3,37,76,0.3)', transition: 'all 0.2s' }}>
              {saving ? '⏳ Menyimpan...' : isEditMode ? '🔄 Update Trip' : '💾 Simpan Trip'}
            </button>
          ) : (
            <div style={{ padding: '14px', borderRadius: 999, background: '#d1fae5', border: '2px solid #6ee7b7', textAlign: 'center', fontWeight: 800, color: '#065f46', fontSize: '0.95em' }}>
              ✅ {isEditMode ? 'Trip berhasil diupdate!' : 'Trip berhasil disimpan!'}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button onClick={handleDownload} style={{ padding: '12px', borderRadius: 999, background: 'white', color: P, border: `2px solid ${S}`, fontWeight: 700, cursor: 'pointer', fontSize: '0.9em', boxShadow: '0 2px 8px rgba(3,37,76,0.08)' }}>
              📥 Download PNG
            </button>
            <button onClick={handleShare} style={{ padding: '12px', borderRadius: 999, background: 'white', color: P, border: `2px solid ${S}`, fontWeight: 700, cursor: 'pointer', fontSize: '0.9em', boxShadow: '0 2px 8px rgba(3,37,76,0.08)' }}>
              📤 Share
            </button>
          </div>

          {saved && (
            <button onClick={() => router.push('/history')} style={{ padding: '12px', borderRadius: 999, background: BGM, color: P, border: `2px solid ${S}`, fontWeight: 700, cursor: 'pointer', fontSize: '0.9em' }}>
              📖 Lihat di History
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

// Simple confetti
function Confetti({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [])

  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    color: ['#03254c','#c4e8ff','#1a4d7a','#a8d8f0','#e1f3ff'][Math.floor(Math.random()*5)],
    size: 6 + Math.random() * 8,
  }))

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998, overflow: 'hidden' }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', top: -20, left: `${p.left}%`,
          width: p.size, height: p.size,
          background: p.color, borderRadius: Math.random() > 0.5 ? '50%' : 2,
          animation: `fall ${1.5 + Math.random()}s ease-in ${p.delay}s forwards`,
        }} />
      ))}
      <style dangerouslySetInnerHTML={{__html:`@keyframes fall{to{transform:translateY(105vh) rotate(360deg);opacity:0}}`}} />
    </div>
  )
}