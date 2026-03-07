'use client'

import { useState, useEffect, useMemo } from 'react'
import Navbar from '@/components/ui/Navbar'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { formatTanggalIndonesia, createTripInvitation, getPublicImageUrl } from '@/lib/utils'
import Toast from '@/components/ui/Toast'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import TripDetailModal from './TripDetailModal'
import type { TripHistory, IdeaReview, TripIdea } from '@/types/types'

const P = '#03254c', S = '#c4e8ff', BG = '#d0efff', BGM = '#e1f3ff', MUTED = '#a0a0b5'
const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

export default function HistoryPage() {
  const [trips, setTrips]       = useState<TripHistory[]>([])
  const [reviews, setReviews]   = useState<IdeaReview[]>([])
  const [ideas, setIdeas]       = useState<TripIdea[]>([])
  const [loading, setLoading]   = useState(true)
  const [filterYear, setFilterYear]   = useState('all')
  const [filterMonth, setFilterMonth] = useState('all')
  const [search, setSearch]           = useState('')
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())
  const [selectedTrip, setSelectedTrip] = useState<TripHistory | null>(null)
  const [inviteStatus, setInviteStatus] = useState<Record<string,string>>({})
  const [toast, setToast]   = useState<{msg:string;type:any}|null>(null)
  const [dialog, setDialog] = useState<{msg:string;onConfirm:()=>void}|null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [tr, rr, ir] = await Promise.all([
      supabase.from('trip_history').select('*').order('trip_date', { ascending: false }),
      supabase.from('idea_reviews').select('*'),
      supabase.from('trip_ideas_v2').select('id, idea_name, photo_url'),
    ])
    setTrips(tr.data || [])
    setReviews(rr.data || [])
    setIdeas(ir.data || [])
    setLoading(false)
  }

  function toggleMonth(key: string) {
    setExpandedMonths(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  async function handleDelete(tripId: string) {
    const trip = trips.find(t => t.id === tripId)
    if (!trip) return
    setDialog({ msg: `Hapus trip ${formatTanggalIndonesia(trip.trip_date)}?`, onConfirm: async () => { setDialog(null); await _deleteTrip(tripId) } })
  }

  async function _deleteTrip(tripId: string) {
    const { error } = await supabase.from('trip_history').delete().eq('id', tripId)
    if (!error) {
      setTrips(prev => prev.filter(t => t.id !== tripId))
      setSelectedTrip(null)
      setToast({ msg: 'Trip berhasil dihapus 🗑️', type: 'success' })
    } else {
      setToast({ msg: 'Gagal menghapus trip', type: 'error' })
    }
  }

  async function handleInvite(trip: TripHistory) {
    setInviteStatus(p => ({ ...p, [trip.id]: 'loading' }))
    const res = await createTripInvitation({ tripId: trip.id, inviterName: 'TripLove', maxUses: 2, expiryDays: 30 })
    if (res.success && res.invitationUrl) {
      try { await navigator.clipboard.writeText(res.invitationUrl) } catch {}
      setInviteStatus(p => ({ ...p, [trip.id]: 'copied' }))
      setToast({ msg: 'Link invitation tersalin! 💌', type: 'success' })
      setTimeout(() => setInviteStatus(p => ({ ...p, [trip.id]: '' })), 3000)
    } else {
      setInviteStatus(p => ({ ...p, [trip.id]: '' }))
      setToast({ msg: 'Gagal membuat link', type: 'error' })
    }
  }

  const stats = useMemo(() => {
    const reviewedIds = new Set(reviews.map(r => r.idea_id))
    return {
      totalTrips: trips.length,
      totalActs:  trips.reduce((s,t) => s + (t.selection_json?.length||0), 0),
      reviewed:   trips.reduce((s,t) => s + (t.selection_json||[]).filter(a => a.idea_id && reviewedIds.has(a.idea_id)).length, 0),
      avgRating:  reviews.length ? (reviews.reduce((s,r) => s+(r.rating||0),0)/reviews.length).toFixed(1) : '—',
    }
  }, [trips, reviews])

  const years = useMemo(() => [...new Set(trips.map(t => new Date(t.trip_date).getFullYear().toString()))].sort((a,b) => +b - +a), [trips])

  const filtered = useMemo(() => trips.filter(t => {
    const d = new Date(t.trip_date)
    if (filterYear !== 'all' && d.getFullYear().toString() !== filterYear) return false
    if (filterMonth !== 'all' && d.getMonth().toString() !== filterMonth) return false
    if (search) {
      const q = search.toLowerCase()
      return (t.selection_json||[]).some(s => s.name?.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q)) || t.secret_message?.toLowerCase().includes(q)
    }
    return true
  }), [trips, filterYear, filterMonth, search])

  const grouped = useMemo(() => {
    const map: Record<string, TripHistory[]> = {}
    filtered.forEach(t => {
      const d = new Date(t.trip_date)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      if (!map[key]) map[key] = []
      map[key].push(t)
    })
    return Object.entries(map).sort((a,b) => b[0].localeCompare(a[0]))
  }, [filtered])

  const ideaMap = useMemo(() => {
    const map: Record<string, TripIdea> = {}
    ideas.forEach(i => { map[i.id] = i })
    return map
  }, [ideas])

  const inp: React.CSSProperties = { padding: '9px 14px', border: `2px solid ${S}`, borderRadius: 12, fontSize: '0.88em', color: P, background: 'white', outline: 'none', cursor: 'pointer' }

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${BG}, ${BGM})` }}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {dialog && <ConfirmDialog message={dialog.msg} onConfirm={dialog.onConfirm} onCancel={() => setDialog(null)} />}

      <Navbar />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontWeight: 900, fontSize: '2em', color: P, margin: '0 0 8px' }}>📖 Riwayat Trip</h1>
          <p style={{ color: MUTED, margin: 0 }}>Semua kenangan perjalanan kalian ❤️</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
          {[
            { icon: '🗓️', val: stats.totalTrips, lbl: 'Total Trip' },
            { icon: '📍', val: stats.totalActs,  lbl: 'Total Aktivitas' },
            { icon: '📝', val: stats.reviewed,   lbl: 'Sudah Diulas' },
            { icon: '⭐', val: stats.avgRating,  lbl: 'Avg Rating' },
          ].map(s => (
            <div key={s.lbl} style={{ background: 'white', borderRadius: 18, border: `2px solid ${S}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 8px rgba(3,37,76,0.06)' }}>
              <span style={{ fontSize: '1.9em' }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: '1.8em', fontWeight: 900, color: P, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: '0.73em', color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 3 }}>{s.lbl}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: 'white', borderRadius: 18, border: `2px solid ${S}`, padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={inp}>
            <option value="all">Semua Tahun</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={inp}>
            <option value="all">Semua Bulan</option>
            {MONTHS.map((m,i) => <option key={i} value={String(i)}>{m}</option>)}
          </select>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Cari aktivitas atau pesan..." style={{ ...inp, width: '100%', boxSizing: 'border-box' }} />
            {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: MUTED }}>✕</button>}
          </div>
          {(filterYear !== 'all' || filterMonth !== 'all' || search) && (
            <button onClick={() => { setFilterYear('all'); setFilterMonth('all'); setSearch('') }} style={{ padding: '9px 16px', borderRadius: 12, background: BGM, color: P, border: `2px solid ${S}`, fontWeight: 700, cursor: 'pointer', fontSize: '0.85em' }}>Reset</button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div style={{ width: 44, height: 44, border: `4px solid ${S}`, borderTopColor: P, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 20, border: `2px dashed ${S}` }}>
            <p style={{ fontSize: '3em', margin: '0 0 12px' }}>🗺️</p>
            <p style={{ fontWeight: 700, color: P, margin: '0 0 6px' }}>{trips.length === 0 ? 'Belum Ada Trip' : 'Tidak Ada Hasil'}</p>
            <p style={{ color: MUTED, fontSize: '0.88em', margin: '0 0 20px' }}>{trips.length === 0 ? 'Buat trip pertama kalian!' : 'Coba ubah filter.'}</p>
            {trips.length === 0 && <Link href="/" style={{ padding: '10px 24px', borderRadius: 999, background: P, color: 'white', fontWeight: 700, textDecoration: 'none', fontSize: '0.9em' }}>🏠 Mulai Rencanain Trip</Link>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {grouped.map(([key, monthTrips]) => {
              const [year, month] = key.split('-')
              const isMonthOpen = expandedMonths.has(key)
              return (
                <div key={key} style={{ background: 'white', borderRadius: 18, border: `2px solid ${isMonthOpen ? P : S}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(3,37,76,0.06)', transition: 'border-color .2s' }}>
                  {/* Month accordion header */}
                  <div
                    onClick={() => toggleMonth(key)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', cursor: 'pointer', background: isMonthOpen ? BGM : 'white', transition: 'background .2s', userSelect: 'none' }}
                  >
                    <span style={{ color: MUTED, fontSize: '0.82em', flexShrink: 0, display: 'inline-block', transition: 'transform .2s', transform: isMonthOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                    <span style={{ flex: 1, fontWeight: 800, color: P, fontSize: '0.95em', textAlign: 'center' }}>
                      📅 {MONTHS[parseInt(month)-1]} {year}
                    </span>
                    <span style={{ fontSize: '0.78em', color: MUTED, fontWeight: 600 }}>{monthTrips.length} trip</span>
                  </div>

                  {/* Month content */}
                  {isMonthOpen && (
                  <div style={{ borderTop: `1.5px solid ${S}`, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {monthTrips.map(trip => {
                      const tripReviews = reviews.filter(r => r.trip_id === trip.id)
                      const reviewCount = tripReviews.length
                      const actCount    = trip.selection_json?.length || 0
                      const avgR        = tripReviews.length ? (tripReviews.reduce((s,r)=>s+(r.rating||0),0)/tripReviews.length).toFixed(1) : null
                      const status      = reviewCount === 0 ? 'none' : reviewCount < actCount ? 'partial' : 'complete'
                      const statusCfg   = {
                        none:     { bg: '#e5e7eb', color: '#6b7280', label: 'Belum diulas' },
                        partial:  { bg: '#fef3c7', color: '#92400e', label: 'Sebagian diulas' },
                        complete: { bg: '#d1fae5', color: '#065f46', label: 'Semua diulas' },
                      }[status]

                      const tripPhotos = (trip.selection_json || [])
                        .filter(a => a.idea_id && ideaMap[a.idea_id]?.photo_url)
                        .slice(0, 4)
                        .map(a => ideaMap[a.idea_id!])

                      return (
                        <div key={trip.id} style={{ background: 'white', borderRadius: 16, border: `2px solid ${S}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(3,37,76,0.05)' }}>

                          {/* Photo strip */}
                          {tripPhotos.length > 0 && (
                            <div style={{ display: 'flex', height: 100, overflow: 'hidden' }}>
                              {tripPhotos.map((idea, i) => (
                                <div key={i} style={{ flex: 1, position: 'relative', borderRight: i < tripPhotos.length - 1 ? '2px solid white' : 'none' }}>
                                  <Image src={getPublicImageUrl(idea.photo_url)} alt={idea.idea_name} fill style={{ objectFit: 'cover' }} unoptimized />
                                  {i === 3 && actCount > 4 && (
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(3,37,76,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <span style={{ color: 'white', fontWeight: 800, fontSize: '1.1em' }}>+{actCount - 4}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          <div style={{ padding: '14px 18px' }}>
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                              <div>
                                <h3 style={{ fontWeight: 800, color: P, margin: '0 0 5px', fontSize: '1em' }}>{trip.trip_day}, {formatTanggalIndonesia(trip.trip_date)}</h3>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                                  <span style={{ padding: '2px 9px', borderRadius: 999, fontSize: '0.74em', fontWeight: 700, background: statusCfg.bg, color: statusCfg.color }}>{statusCfg.label}</span>
                                  {avgR && <span style={{ fontSize: '0.8em', color: '#f59e0b', fontWeight: 700 }}>⭐ {avgR}</span>}
                                  <span style={{ fontSize: '0.75em', color: MUTED }}>{actCount} aktivitas</span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={() => setSelectedTrip(trip)} style={{ padding: '7px 14px', borderRadius: 10, background: P, color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.82em' }}>🔍 Detail</button>
                                <button onClick={() => handleInvite(trip)} disabled={inviteStatus[trip.id]==='loading'} style={{ padding: '7px 12px', borderRadius: 10, background: inviteStatus[trip.id]==='copied' ? '#d1fae5' : BGM, color: inviteStatus[trip.id]==='copied' ? '#065f46' : P, border: `2px solid ${S}`, fontWeight: 700, cursor: 'pointer', fontSize: '0.82em' }}>
                                  {inviteStatus[trip.id]==='loading' ? '⏳' : inviteStatus[trip.id]==='copied' ? '✅' : '💌'}
                                </button>
                                <button onClick={() => handleDelete(trip.id)} style={{ padding: '7px 10px', borderRadius: 10, background: '#fff1f2', color: '#f43f5e', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.82em' }}>🗑️</button>
                              </div>
                            </div>

                            {/* Activities */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {(trip.selection_json||[]).slice(0,6).map((a,i) => (
                                <span key={i} style={{ padding: '4px 12px', borderRadius: 999, fontSize: '0.8em', background: BGM, color: P, border: `1px solid ${S}` }}>{a.name}</span>
                              ))}
                              {actCount > 6 && <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: '0.8em', background: P, color: 'white' }}>+{actCount-6}</span>}
                            </div>

                            {/* Secret message */}
                            {trip.secret_message && trip.secret_message !== 'Tidak ada pesan rahasia.' && (
                              <div style={{ marginTop: 10, padding: '8px 14px', borderRadius: 10, background: '#fffbeb', border: '1.5px solid #fcd34d', fontSize: '0.85em', color: '#92400e', fontStyle: 'italic' }}>
                                💌 {trip.secret_message}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      {selectedTrip && (
        <TripDetailModal
          trip={selectedTrip}
          reviews={reviews}
          onClose={() => setSelectedTrip(null)}
          onDelete={() => handleDelete(selectedTrip.id)}
          onReviewSaved={loadData}
          onTripUpdated={(updated: TripHistory) => {
            setTrips(prev => prev.map(t => t.id === updated.id ? updated : t))
            setSelectedTrip(updated)
            setToast({ msg: 'Trip diupdate! ✅', type: 'success' })
          }}
        />
      )}

      <style dangerouslySetInnerHTML={{__html:`
        @keyframes spin { to { transform: rotate(360deg) } }
      `}} />
    </div>
  )
}