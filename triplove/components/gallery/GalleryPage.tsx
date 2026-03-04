'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Navbar from '@/components/ui/Navbar'
import Image from 'next/image'
import { useData } from '@/context/DataContext'
import { supabase } from '@/lib/supabase'
import { getPublicImageUrl, getPublicVideoUrl, formatTanggalIndonesia } from '@/lib/utils'
import type { IdeaReview, TripHistory } from '@/types/types'

const P = '#03254c', S = '#c4e8ff', BG = '#d0efff', BGM = '#e1f3ff', MUTED = '#a0a0b5'

interface MediaItem {
  id: string
  type: 'photo' | 'video'
  url: string
  reviewerName: string
  rating: number
  reviewText: string
  ideaName: string
  categoryName: string
  tripDate?: string
  tripDay?: string
  tripId?: string
}

export default function GalleryPage() {
  const { ideas, reviews, loading, loadAllData } = useData()
  const [trips, setTrips] = useState<Record<string, TripHistory>>({})
  const [filter, setFilter] = useState<'all' | 'photo' | 'video'>('all')
  const [filterCat, setFilterCat] = useState('all')
  const [search, setSearch] = useState('')
  const [lightbox, setLightbox] = useState<MediaItem | null>(null)
  const [lightboxIdx, setLightboxIdx] = useState(0)

  useEffect(() => {
    loadAllData()
    supabase.from('trip_history').select('*').then(({ data }) => {
      const map: Record<string, TripHistory> = {}
      ;(data || []).forEach((t: any) => { map[t.id] = t })
      setTrips(map)
    })
  }, [])

  // Build flat media list from all reviews
  const allMedia = useMemo<MediaItem[]>(() => {
    const items: MediaItem[] = []
    reviews.forEach(r => {
      const idea = ideas.find(i => i.id === r.idea_id)
      const trip = r.trip_id ? trips[r.trip_id] : undefined
      const base = {
        id: r.id,
        reviewerName: r.reviewer_name || 'Anonim',
        rating: r.rating || 0,
        reviewText: r.review_text || '',
        ideaName: idea?.idea_name || 'Aktivitas',
        categoryName: idea?.category_name || '',
        tripDate: trip?.trip_date,
        tripDay: trip?.trip_day,
        tripId: r.trip_id || undefined,
      }
      const photos = Array.isArray(r.photo_url) ? r.photo_url : r.photo_url ? [r.photo_url] : []
      photos.forEach((url, i) => {
        items.push({ ...base, id: `${r.id}-p${i}`, type: 'photo', url: getPublicImageUrl(url) })
      })
      if (r.video_url) {
        const vurl = getPublicVideoUrl(r.video_url)
        if (vurl) items.push({ ...base, id: `${r.id}-v`, type: 'video', url: vurl })
      }
    })
    return items.reverse()
  }, [reviews, ideas, trips])

  const categories = useMemo(() => ['all', ...Array.from(new Set(allMedia.map(m => m.categoryName).filter(Boolean)))], [allMedia])

  const filtered = useMemo(() => {
    return allMedia.filter(m => {
      if (filter !== 'all' && m.type !== filter) return false
      if (filterCat !== 'all' && m.categoryName !== filterCat) return false
      if (search) {
        const q = search.toLowerCase()
        return m.ideaName.toLowerCase().includes(q) || m.reviewerName.toLowerCase().includes(q) || m.reviewText.toLowerCase().includes(q)
      }
      return true
    })
  }, [allMedia, filter, filterCat, search])

  const openLightbox = useCallback((item: MediaItem) => {
    const idx = filtered.indexOf(item)
    setLightbox(item)
    setLightboxIdx(idx)
  }, [filtered])

  const navLightbox = useCallback((dir: 1 | -1) => {
    const next = lightboxIdx + dir
    if (next < 0 || next >= filtered.length) return
    setLightbox(filtered[next])
    setLightboxIdx(next)
  }, [lightboxIdx, filtered])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!lightbox) return
      if (e.key === 'ArrowRight') navLightbox(1)
      if (e.key === 'ArrowLeft') navLightbox(-1)
      if (e.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, navLightbox])

  // Split into columns for masonry — 3 desktop, 2 mobile
  const columns = useMemo(() => {
    const cols: MediaItem[][] = [[], []]
    filtered.forEach((item, i) => cols[i % 2].push(item))
    return cols
  }, [filtered])

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${BG}, ${BGM})` }}>

      {/* Header */}
      <Navbar />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 16px' }}>

        {/* Hero title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontWeight: 900, fontSize: '2em', color: P, margin: '0 0 8px' }}>📸 Gallery</h1>
          <p style={{ color: MUTED, margin: '0 0 4px' }}>Semua kenangan indah kalian</p>
          <p style={{ color: P, fontWeight: 700, fontSize: '0.9em' }}>{allMedia.filter(m=>m.type==='photo').length} foto · {allMedia.filter(m=>m.type==='video').length} video</p>
        </div>

        {/* Filters */}
        <div style={{ background: 'white', borderRadius: 20, border: `2px solid ${S}`, padding: '16px 20px', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Type filter */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['all','Semua 🌟'],['photo','Foto 📷'],['video','Video 🎬']].map(([v,l]) => (
              <button key={v} onClick={() => setFilter(v as any)} style={{ padding: '7px 18px', borderRadius: 999, fontSize: '0.85em', fontWeight: 700, cursor: 'pointer', border: 'none', background: filter === v ? P : BGM, color: filter === v ? 'white' : P, transition: 'all 0.2s' }}>{l}</button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Category filter */}
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ padding: '8px 14px', borderRadius: 12, border: `2px solid ${S}`, fontSize: '0.88em', color: P, background: 'white', outline: 'none', cursor: 'pointer' }}>
              <option value="all">Semua Kategori</option>
              {categories.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Search */}
            <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Cari tempat, nama, ulasan..." style={{ width: '100%', padding: '8px 14px', borderRadius: 12, border: `2px solid ${S}`, fontSize: '0.88em', color: P, background: 'white', outline: 'none', boxSizing: 'border-box' }} />
              {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: MUTED }}>✕</button>}
            </div>

            <span style={{ fontSize: '0.82em', color: MUTED, fontWeight: 600 }}>{filtered.length} item</span>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div style={{ width: 44, height: 44, border: `4px solid ${S}`, borderTopColor: P, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 20, border: `2px dashed ${S}` }}>
            <p style={{ fontSize: '3em', margin: '0 0 12px' }}>📭</p>
            <p style={{ fontWeight: 700, color: P, margin: '0 0 6px' }}>{allMedia.length === 0 ? 'Belum ada foto atau video' : 'Tidak ada hasil'}</p>
            <p style={{ color: MUTED, fontSize: '0.88em', margin: 0 }}>{allMedia.length === 0 ? 'Tambahkan review dengan foto atau video!' : 'Coba ubah filter'}</p>
          </div>
        ) : (
          <>
            <div className="gallery-grid" style={{ display: 'flex', gap: 10 }}>
              {columns.map((col, ci) => (
                <div key={ci} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.map(item => (
                    <MediaCard key={item.id} item={item} onClick={() => openLightbox(item)} />
                  ))}
                </div>
              ))}
            </div>
            <style dangerouslySetInnerHTML={{__html:`
              @keyframes spin{to{transform:rotate(360deg)}}
              @keyframes fadeIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}
              .gallery-grid { animation: fadeIn 0.3s ease; }
            `}} />
          </>
        )}
      </main>

      {/* Lightbox */}
      {lightbox && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(3,37,76,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setLightbox(null) }}
        >
          {/* Nav prev */}
          {lightboxIdx > 0 && (
            <button onClick={() => navLightbox(-1)} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 48, height: 48, fontSize: '1.4em', cursor: 'pointer', color: 'white', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          )}
          {/* Nav next */}
          {lightboxIdx < filtered.length - 1 && (
            <button onClick={() => navLightbox(1)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 48, height: 48, fontSize: '1.4em', cursor: 'pointer', color: 'white', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          )}
          {/* Close */}
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: '1.1em', cursor: 'pointer', color: 'white', zIndex: 10 }}>✕</button>

          {/* Counter */}
          <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.6)', fontSize: '0.82em', fontWeight: 600 }}>{lightboxIdx + 1} / {filtered.length}</div>

          <div style={{ maxWidth: 760, width: '100%', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            {/* Media */}
            {lightbox.type === 'photo' ? (
              <div style={{ position: 'relative', width: '100%', maxHeight: '65vh', borderRadius: 20, overflow: 'hidden' }}>
                <img src={lightbox.url} alt={lightbox.ideaName} style={{ width: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: 20, display: 'block' }} />
              </div>
            ) : (
              <video src={lightbox.url} controls autoPlay style={{ width: '100%', maxHeight: '65vh', borderRadius: 20, background: '#000' }} />
            )}

            {/* Info card */}
            <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', borderRadius: 16, padding: '14px 20px', width: '100%', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontWeight: 800, color: 'white', margin: '0 0 3px', fontSize: '1em' }}>{lightbox.ideaName}</p>
                  <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.82em' }}>{lightbox.categoryName}{lightbox.tripDate ? ` · ${formatTanggalIndonesia(lightbox.tripDate)}` : ''}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {lightbox.reviewerName && <span style={{ padding: '4px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', fontSize: '0.8em', fontWeight: 700 }}>👤 {lightbox.reviewerName}</span>}
                  {lightbox.rating > 0 && <span style={{ color: '#f59e0b', fontSize: '0.95em' }}>{'★'.repeat(lightbox.rating)}</span>}
                </div>
              </div>
              {lightbox.reviewText && <p style={{ margin: '10px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.88em', fontStyle: 'italic', lineHeight: 1.5 }}>"{lightbox.reviewText}"</p>}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

function MediaCard({ item, onClick }: { item: MediaItem; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', borderRadius: 14, overflow: 'hidden',
        cursor: 'pointer', background: '#c4e8ff',
        boxShadow: hovered ? '0 8px 24px rgba(3,37,76,0.18)' : '0 2px 8px rgba(3,37,76,0.08)',
        transform: hovered ? 'translateY(-3px)' : 'none',
        transition: 'all 0.25s ease',
        border: hovered ? '2px solid #03254c' : '2px solid transparent',
      }}
    >
      {item.type === 'photo' ? (
        <div style={{ position: 'relative' }}>
          <img
            src={item.url}
            alt={item.ideaName}
            onLoad={() => setLoaded(true)}
            style={{ width: '100%', display: 'block', verticalAlign: 'bottom', opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }}
            loading="lazy"
          />
          {!loaded && <div style={{ paddingTop: '75%', background: 'linear-gradient(135deg, #c4e8ff, #e1f3ff)', position: 'relative' }}><span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5em' }}>📷</span></div>}
        </div>
      ) : (
        <div style={{ position: 'relative', paddingTop: '56.25%', background: '#001a33' }}>
          <video src={item.url} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(3,37,76,0.3)', zIndex: 1 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1em', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>▶</div>
          </div>
        </div>
      )}

      {/* Hover overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(3,37,76,0.88) 0%, rgba(3,37,76,0.1) 55%, transparent 100%)',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.25s ease',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '10px 12px',
      }}>
        <p style={{ color: 'white', fontWeight: 800, fontSize: '0.82em', margin: '0 0 3px', lineHeight: 1.3 }}>{item.ideaName}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {item.rating > 0 && <span style={{ color: '#f59e0b', fontSize: '0.75em' }}>{'★'.repeat(item.rating)}</span>}
          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.72em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.reviewerName}</span>
        </div>
      </div>

      {/* Badges */}
      <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 5 }}>
        {item.type === 'video' && (
          <span style={{ background: 'rgba(3,37,76,0.85)', color: 'white', borderRadius: 6, padding: '2px 7px', fontSize: '0.68em', fontWeight: 700, backdropFilter: 'blur(4px)' }}>🎬</span>
        )}
        {item.rating > 0 && (
          <span style={{ background: 'rgba(245,158,11,0.9)', color: 'white', borderRadius: 6, padding: '2px 7px', fontSize: '0.68em', fontWeight: 700, backdropFilter: 'blur(4px)' }}>★ {item.rating}</span>
        )}
      </div>
    </div>
  )
}