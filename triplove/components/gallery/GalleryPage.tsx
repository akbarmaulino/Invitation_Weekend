'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Navbar from '@/components/ui/Navbar'
import Image from 'next/image'
import { useData } from '@/context/DataContext'
import { supabase } from '@/lib/supabase'
import { getPublicImageUrl, getPublicVideoUrl, formatTanggalIndonesia } from '@/lib/utils'
import type { IdeaReview, TripHistory } from '@/types/types'

const P = '#03254c', S = '#c4e8ff', BG = '#d0efff', BGM = '#e1f3ff', MUTED = '#a0a0b5'

// ─── Default playlist ─────────────────────────────────────────────────────────
const DEFAULT_PLAYLIST = [
  { title: 'River Flows In You', artist: 'Yiruma', url: 'https://www.youtube.com/embed/7maJOI3QMu0?autoplay=1&controls=0' },
  { title: 'A Thousand Years', artist: 'The Piano Guys', url: 'https://www.youtube.com/embed/QgaTQ5-XfMM?autoplay=1&controls=0' },
  { title: 'Experience', artist: 'Ludovico Einaudi', url: 'https://www.youtube.com/embed/hN_q-_jjV3Y?autoplay=1&controls=0' },
  { title: "Comptine d'un autre été", artist: 'Yann Tiersen', url: 'https://www.youtube.com/embed/HlgrqGaD3HY?autoplay=1&controls=0' },
  { title: 'Married Life', artist: 'Michael Giacchino', url: 'https://www.youtube.com/embed/oQZxT9RQfm8?autoplay=1&controls=0' },
  { title: 'Kiss the Rain', artist: 'Yiruma', url: 'https://www.youtube.com/embed/wTyGFa5Hhkk?autoplay=1&controls=0' },
  { title: 'Clair de Lune', artist: 'Debussy', url: 'https://www.youtube.com/embed/WNcsUNKlAKw?autoplay=1&controls=0' },
  { title: 'Interstellar Theme', artist: 'Hans Zimmer', url: 'https://www.youtube.com/embed/UDVtMYqUAyw?autoplay=1&controls=0' },
]

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

interface TripGroup {
  trip: TripHistory
  media: MediaItem[]
}

type ViewMode = 'masonry' | 'timeline' | 'moodboard'

export default function GalleryPage() {
  const { ideas, reviews, loading, loadAllData } = useData()
  const [trips, setTrips] = useState<Record<string, TripHistory>>({})
  const [filter, setFilter] = useState<'all' | 'photo' | 'video'>('all')
  const [filterCat, setFilterCat] = useState('all')
  const [search, setSearch] = useState('')
  const [lightbox, setLightbox] = useState<MediaItem | null>(null)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const [diaryGroup, setDiaryGroup] = useState<TripGroup | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('timeline')

  // Music player state
  const [playlist, setPlaylist] = useState(DEFAULT_PLAYLIST)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [newTrackTitle, setNewTrackTitle] = useState('')
  const [newTrackArtist, setNewTrackArtist] = useState('')
  const [newTrackUrl, setNewTrackUrl] = useState('')
  const [showAddTrack, setShowAddTrack] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    loadAllData()
    supabase.from('trip_history').select('*').then(({ data }) => {
      const map: Record<string, TripHistory> = {}
      ;(data || []).forEach((t: any) => { map[t.id] = t })
      setTrips(map)
    })
  }, [])

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

  const filtered = useMemo(() => allMedia.filter(m => {
    if (filter !== 'all' && m.type !== filter) return false
    if (filterCat !== 'all' && m.categoryName !== filterCat) return false
    if (search) {
      const q = search.toLowerCase()
      return m.ideaName.toLowerCase().includes(q) || m.reviewerName.toLowerCase().includes(q) || m.reviewText.toLowerCase().includes(q)
    }
    return true
  }), [allMedia, filter, filterCat, search])

  // Group by trip for timeline & moodboard
  const tripGroups = useMemo<TripGroup[]>(() => {
    const map: Record<string, TripGroup> = {}
    filtered.forEach(m => {
      const key = m.tripId || '__no_trip__'
      if (!map[key]) {
        const trip = m.tripId ? trips[m.tripId] : null
        map[key] = { trip: trip as TripHistory, media: [] }
      }
      map[key].media.push(m)
    })
    return Object.values(map)
      .filter(g => g.media.length > 0)
      .sort((a, b) => {
        if (!a.trip?.trip_date) return 1
        if (!b.trip?.trip_date) return -1
        return b.trip.trip_date.localeCompare(a.trip.trip_date)
      })
  }, [filtered, trips])

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

  const columns = useMemo(() => {
    const cols: MediaItem[][] = [[], []]
    filtered.forEach((item, i) => cols[i % 2].push(item))
    return cols
  }, [filtered])

  function addTrack() {
    if (!newTrackTitle || !newTrackUrl) return
    const embedUrl = newTrackUrl.includes('youtube.com/watch?v=')
      ? newTrackUrl.replace('watch?v=', 'embed/') + '?autoplay=1&controls=0'
      : newTrackUrl.includes('youtu.be/')
        ? 'https://www.youtube.com/embed/' + newTrackUrl.split('youtu.be/')[1] + '?autoplay=1&controls=0'
        : newTrackUrl
    setPlaylist(prev => [...prev, { title: newTrackTitle, artist: newTrackArtist, url: embedUrl }])
    setNewTrackTitle(''); setNewTrackArtist(''); setNewTrackUrl('')
    setShowAddTrack(false)
  }

  const track = playlist[currentTrack]

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${BG}, ${BGM})`, fontFamily: "'DM Sans', sans-serif" }}>
      <style dangerouslySetInnerHTML={{__html:`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes floatIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .media-card:hover .hover-overlay{opacity:1!important}
        .media-card:hover{transform:translateY(-4px)!important;box-shadow:0 12px 32px rgba(3,37,76,0.18)!important}
        .timeline-entry{animation:fadeIn 0.5s ease both;animation-delay:var(--delay,0s)}.moodboard-card{animation:fadeIn 0.4s ease both;animation-delay:var(--delay,0s)}
        .player-btn:hover{background:rgba(255,255,255,0.2)!important}
        .track-item:hover{background:${BGM}!important}
      `}} />

      <Navbar />

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 16px 120px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '2.4em', color: P, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            📸 Galeri Kenangan
          </h1>
          <p style={{ color: MUTED, margin: '0 0 4px', fontSize: '0.92em' }}>Semua momen indah kalian berdua</p>
          <p style={{ color: P, fontWeight: 700, fontSize: '0.88em' }}>
            {allMedia.filter(m=>m.type==='photo').length} foto · {allMedia.filter(m=>m.type==='video').length} video · {tripGroups.length} trip
          </p>
        </div>

        {/* Controls bar */}
        <div style={{ background: 'white', borderRadius: 20, border: `2px solid ${S}`, padding: '14px 18px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* View mode + type filter */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* View mode */}
            <div style={{ display: 'flex', gap: 4, background: BGM, borderRadius: 12, padding: 4 }}>
              {([['timeline','🕐 Timeline'],['moodboard','🎞️ Moodboard'],['masonry','⊞ Grid']] as [ViewMode,string][]).map(([v,l]) => (
                <button key={v} onClick={() => setViewMode(v)} style={{ padding: '6px 14px', borderRadius: 9, border: 'none', fontWeight: 700, fontSize: '0.8em', cursor: 'pointer', background: viewMode === v ? P : 'transparent', color: viewMode === v ? 'white' : MUTED, transition: 'all .2s' }}>{l}</button>
              ))}
            </div>

            <div style={{ width: 1, height: 28, background: S }} />

            {/* Type filter */}
            {[['all','Semua'],['photo','📷 Foto'],['video','🎬 Video']].map(([v,l]) => (
              <button key={v} onClick={() => setFilter(v as any)} style={{ padding: '6px 14px', borderRadius: 999, fontSize: '0.82em', fontWeight: 700, cursor: 'pointer', border: 'none', background: filter === v ? P : BGM, color: filter === v ? 'white' : P, transition: 'all .2s' }}>{l}</button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ padding: '8px 14px', borderRadius: 12, border: `2px solid ${S}`, fontSize: '0.85em', color: P, background: 'white', outline: 'none', cursor: 'pointer' }}>
              <option value="all">Semua Kategori</option>
              {categories.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div style={{ flex: 1, minWidth: 160, position: 'relative' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Cari tempat, ulasan..." style={{ width: '100%', padding: '8px 14px', borderRadius: 12, border: `2px solid ${S}`, fontSize: '0.85em', color: P, background: 'white', outline: 'none', boxSizing: 'border-box' }} />
              {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: MUTED }}>✕</button>}
            </div>
            <span style={{ fontSize: '0.8em', color: MUTED, fontWeight: 600, whiteSpace: 'nowrap' }}>{filtered.length} item</span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div style={{ width: 44, height: 44, border: `4px solid ${S}`, borderTopColor: P, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 20, border: `2px dashed ${S}` }}>
            <p style={{ fontSize: '3em', margin: '0 0 12px' }}>📭</p>
            <p style={{ fontWeight: 700, color: P, margin: '0 0 6px' }}>{allMedia.length === 0 ? 'Belum ada foto atau video' : 'Tidak ada hasil'}</p>
            <p style={{ color: MUTED, fontSize: '0.88em', margin: 0 }}>{allMedia.length === 0 ? 'Tambahkan review dengan foto dulu!' : 'Coba ubah filter'}</p>
          </div>
        ) : viewMode === 'masonry' ? (
          // ── MASONRY GRID ──────────────────────────────────────────────────
          <div style={{ display: 'flex', gap: 10 }}>
            {columns.map((col, ci) => (
              <div key={ci} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.map(item => <MediaCard key={item.id} item={item} onClick={() => openLightbox(item)} />)}
              </div>
            ))}
          </div>
        ) : viewMode === 'timeline' ? (
          // ── DIARY / POLAROID STACK VIEW ───────────────────────────────────
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24, padding: '8px 4px' }}>
              {tripGroups.map((group, gi) => (
                <PolaroidStack key={group.trip?.id || gi} group={group} index={gi} onClick={() => setDiaryGroup(group)} />
              ))}
            </div>

            {/* Scattered diary modal */}
            {diaryGroup && (
              <DiaryModal
                group={diaryGroup}
                onClose={() => setDiaryGroup(null)}
                onOpenLightbox={openLightbox}
              />
            )}
          </>
        ) : (
          // ── MOODBOARD ─────────────────────────────────────────────────────
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {tripGroups.map((group, gi) => (
              <div key={group.trip?.id || gi} className="moodboard-card" style={{ ['--delay' as any]: `${gi * 0.08}s`, background: 'white', borderRadius: 24, border: `2px solid ${S}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(3,37,76,0.08)' }}>
                {/* Trip header */}
                <div style={{ padding: '14px 20px', borderBottom: `1.5px solid ${S}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    {group.trip ? (
                      <>
                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400, fontSize: '1.05em', color: P, margin: '0 0 2px' }}>
                          {group.trip.trip_day}, {formatTanggalIndonesia(group.trip.trip_date)}
                        </h3>
                        {group.trip.secret_message && group.trip.secret_message !== 'Tidak ada pesan rahasia.' && (
                          <p style={{ margin: 0, fontSize: '0.75em', color: '#92400e', fontStyle: 'italic' }}>💌 {group.trip.secret_message}</p>
                        )}
                      </>
                    ) : (
                      <h3 style={{ fontWeight: 700, fontSize: '0.9em', color: MUTED, margin: 0 }}>Kenangan lainnya</h3>
                    )}
                  </div>
                  <span style={{ padding: '4px 12px', borderRadius: 999, background: BGM, color: P, fontSize: '0.75em', fontWeight: 700, border: `1px solid ${S}` }}>{group.media.length} foto</span>
                </div>

                {/* Auto carousel */}
                <AutoCarousel items={group.media} onClickItem={openLightbox} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── FLOATING MUSIC PLAYER ─────────────────────────────────────────── */}
      <div style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>

        {/* Playlist panel */}
        {showPlaylist && (
          <div style={{ background: 'white', borderRadius: 20, border: `2px solid ${S}`, boxShadow: '0 8px 32px rgba(3,37,76,0.18)', width: 300, overflow: 'hidden', animation: 'floatIn .25s ease' }}>
            <div style={{ padding: '14px 16px', borderBottom: `1.5px solid ${S}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, color: P, fontSize: '0.9em' }}>🎵 Playlist</span>
              <button onClick={() => setShowAddTrack(p => !p)} style={{ padding: '4px 10px', borderRadius: 8, background: showAddTrack ? P : BGM, color: showAddTrack ? 'white' : P, border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.75em' }}>+ Tambah</button>
            </div>

            {/* Add track form */}
            {showAddTrack && (
              <div style={{ padding: '12px 16px', borderBottom: `1.5px solid ${S}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input value={newTrackTitle} onChange={e => setNewTrackTitle(e.target.value)} placeholder="Judul lagu *" style={{ padding: '7px 10px', borderRadius: 8, border: `1.5px solid ${S}`, fontSize: '0.82em', color: P, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                <input value={newTrackArtist} onChange={e => setNewTrackArtist(e.target.value)} placeholder="Artis" style={{ padding: '7px 10px', borderRadius: 8, border: `1.5px solid ${S}`, fontSize: '0.82em', color: P, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                <input value={newTrackUrl} onChange={e => setNewTrackUrl(e.target.value)} placeholder="YouTube URL *" style={{ padding: '7px 10px', borderRadius: 8, border: `1.5px solid ${S}`, fontSize: '0.82em', color: P, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                <button onClick={addTrack} style={{ padding: '7px', borderRadius: 8, background: P, color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.82em' }}>Tambah ke Playlist</button>
              </div>
            )}

            {/* Track list */}
            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
              {playlist.map((t, i) => (
                <div key={i} className="track-item" onClick={() => { setCurrentTrack(i); setIsPlaying(true) }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer', background: i === currentTrack ? BGM : 'white', transition: 'background .15s', borderBottom: `1px solid ${S}` }}>
                  <span style={{ fontSize: '0.75em', color: i === currentTrack && isPlaying ? P : MUTED, fontWeight: 700, width: 18, flexShrink: 0 }}>
                    {i === currentTrack && isPlaying ? '▶' : i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, color: P, fontSize: '0.82em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</p>
                    <p style={{ margin: 0, color: MUTED, fontSize: '0.72em' }}>{t.artist}</p>
                  </div>
                  {i === currentTrack && isPlaying && (
                    <span style={{ animation: 'pulse 1s infinite', fontSize: '0.7em' }}>🎵</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Player pill */}
        <div style={{ background: P, borderRadius: 999, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 6px 24px rgba(3,37,76,0.35)', minWidth: showPlayer ? 260 : 'auto', transition: 'all .3s ease' }}>
          {showPlayer ? (
            <>
              {/* Track info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, color: 'white', fontWeight: 700, fontSize: '0.8em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.title}</p>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.7em' }}>{track.artist}</p>
              </div>

              {/* Controls */}
              <button className="player-btn" onClick={() => setCurrentTrack(p => (p - 1 + playlist.length) % playlist.length)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8em', transition: 'background .15s' }}>‹</button>
              <button className="player-btn" onClick={() => setIsPlaying(p => !p)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', transition: 'background .15s' }}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button className="player-btn" onClick={() => setCurrentTrack(p => (p + 1) % playlist.length)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8em', transition: 'background .15s' }}>›</button>
              <button className="player-btn" onClick={() => setShowPlaylist(p => !p)} style={{ background: showPlaylist ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8em', transition: 'background .15s' }}>☰</button>
              <button className="player-btn" onClick={() => { setShowPlayer(false); setIsPlaying(false); setShowPlaylist(false) }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7em', transition: 'background .15s' }}>✕</button>
            </>
          ) : (
            <button onClick={() => setShowPlayer(true)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.85em', padding: 0 }}>
              🎵 <span>Musik</span>
            </button>
          )}
        </div>
      </div>

      {/* Hidden YouTube iframe for audio */}
      {isPlaying && (
        <iframe
          ref={iframeRef}
          src={track.url}
          style={{ position: 'fixed', width: 0, height: 0, border: 'none', opacity: 0, pointerEvents: 'none' }}
          allow="autoplay"
          title="music-player"
        />
      )}

      {/* Lightbox */}
      {lightbox && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(3,37,76,0.96)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setLightbox(null) }}>
          {lightboxIdx > 0 && <button onClick={() => navLightbox(-1)} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 48, height: 48, fontSize: '1.4em', cursor: 'pointer', color: 'white', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>}
          {lightboxIdx < filtered.length - 1 && <button onClick={() => navLightbox(1)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 48, height: 48, fontSize: '1.4em', cursor: 'pointer', color: 'white', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>}
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: '1.1em', cursor: 'pointer', color: 'white', zIndex: 10 }}>✕</button>
          <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.6)', fontSize: '0.82em', fontWeight: 600 }}>{lightboxIdx + 1} / {filtered.length}</div>
          <div style={{ maxWidth: 760, width: '100%', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            {lightbox.type === 'photo' ? (
              <img src={lightbox.url} alt={lightbox.ideaName} style={{ width: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: 20, display: 'block' }} />
            ) : (
              <video src={lightbox.url} controls autoPlay style={{ width: '100%', maxHeight: '65vh', borderRadius: 20, background: '#000' }} />
            )}
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

// ── POLAROID STACK ────────────────────────────────────────────────────────────
function PolaroidStack({ group, index, onClick }: { group: TripGroup; index: number; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const photos = group.media.filter(m => m.type === 'photo').slice(0, 4)
  const videos = group.media.filter(m => m.type === 'video')
  const total = group.media.length

  // Deterministic rotations based on index
  const rotations = [-4, 3, -2, 5]

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
    >
      {/* Stack container */}
      <div style={{ position: 'relative', width: 160, height: 180 }}>
        {/* Shadow cards behind */}
        {photos.slice(1).reverse().map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: (photos.slice(1).length - i) * 3,
            left: '50%',
            transform: `translateX(-50%) rotate(${rotations[i + 1]}deg)`,
            width: 148, height: 170,
            background: 'white',
            borderRadius: 4,
            boxShadow: '0 2px 8px rgba(3,37,76,0.15)',
            transition: 'transform .35s ease',
            ...(hovered ? { transform: `translateX(calc(-50% + ${(i - 0.5) * 28}px)) rotate(${rotations[i + 1] * 1.8}deg) translateY(${i * 4}px)` } : {}),
          }} />
        ))}

        {/* Front polaroid */}
        {photos[0] ? (
          <div style={{
            position: 'absolute', top: 0, left: '50%',
            transform: `translateX(-50%) rotate(${hovered ? rotations[0] * 0.3 : rotations[0]}deg) ${hovered ? 'translateY(-6px) scale(1.04)' : ''}`,
            width: 148, background: 'white', borderRadius: 4,
            boxShadow: hovered ? '0 12px 32px rgba(3,37,76,0.25)' : '0 4px 14px rgba(3,37,76,0.18)',
            transition: 'all .35s cubic-bezier(.25,.46,.45,.94)',
            overflow: 'hidden',
            zIndex: 4,
          }}>
            <div style={{ width: '100%', height: 130, overflow: 'hidden' }}>
              <img src={photos[0].url} alt={photos[0].ideaName} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
            </div>
            {/* Polaroid bottom white strip */}
            <div style={{ padding: '6px 8px 8px', background: 'white' }}>
              <p style={{ margin: 0, fontSize: '0.6em', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: '#555', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {photos[0].ideaName}
              </p>
            </div>
          </div>
        ) : videos[0] ? (
          <div style={{
            position: 'absolute', top: 0, left: '50%',
            transform: `translateX(-50%) rotate(${rotations[0]}deg)`,
            width: 148, background: 'white', borderRadius: 4,
            boxShadow: '0 4px 14px rgba(3,37,76,0.18)',
            overflow: 'hidden', zIndex: 4,
          }}>
            <div style={{ width: '100%', height: 130, background: '#0a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em' }}>▶</div>
            </div>
            <div style={{ padding: '6px 8px 8px' }}>
              <p style={{ margin: 0, fontSize: '0.6em', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: '#555', textAlign: 'center' }}>Video</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Trip info below stack */}
      <div style={{ textAlign: 'center', maxWidth: 170 }}>
        <p style={{ margin: '0 0 2px', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '0.82em', color: '#03254c', fontWeight: 700, lineHeight: 1.3 }}>
          {group.trip ? `${group.trip.trip_day}, ${formatTanggalIndonesia(group.trip.trip_date)}` : 'Kenangan'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <span style={{ fontSize: '0.68em', color: MUTED }}>{total} kenangan</span>
          {videos.length > 0 && <span style={{ fontSize: '0.65em', color: MUTED }}>· 🎬 {videos.length}</span>}
        </div>
        {group.trip?.secret_message && group.trip.secret_message !== 'Tidak ada pesan rahasia.' && (
          <div style={{ marginTop: 4, padding: '3px 8px', borderRadius: 6, background: '#fffbeb', border: '1px solid #fcd34d', fontSize: '0.62em', color: '#92400e', fontStyle: 'italic' }}>
            💌 {group.trip.secret_message.slice(0, 30)}{group.trip.secret_message.length > 30 ? '…' : ''}
          </div>
        )}
      </div>
    </div>
  )
}

// ── DIARY MODAL ───────────────────────────────────────────────────────────────
function DiaryModal({ group, onClose, onOpenLightbox }: { group: TripGroup; onClose: () => void; onOpenLightbox: (item: MediaItem) => void }) {
  const [zoomed, setZoomed] = useState<string | null>(null)

  // Seeded random rotations + positions so they're stable
  function seededRand(seed: number, min: number, max: number) {
    const x = Math.sin(seed) * 10000
    return min + (x - Math.floor(x)) * (max - min)
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(3,37,76,0.88)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Header */}
      <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400, fontSize: '1.3em', color: 'white', margin: '0 0 3px' }}>
            {group.trip ? `${group.trip.trip_day}, ${formatTanggalIndonesia(group.trip.trip_date)}` : 'Kenangan'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.8em' }}>{group.media.length} kenangan · klik foto untuk zoom</p>
        </div>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 40, height: 40, color: 'white', fontSize: '1.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
      </div>

      {/* Scattered photos area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', margin: '16px 0 0' }}>
        {group.media.map((item, i) => {
          const rot = seededRand(i * 7 + 1, -12, 12)
          const tx = seededRand(i * 13 + 2, 5, 80)   // % from left
          const ty = seededRand(i * 11 + 3, 5, 70)   // % from top
          const isZoomed = zoomed === item.id
          const zIdx = isZoomed ? 100 : i + 1

          return (
            <div
              key={item.id}
              onClick={e => {
                e.stopPropagation()
                if (isZoomed) {
                  onOpenLightbox(item)
                  setZoomed(null)
                } else {
                  setZoomed(item.id)
                }
              }}
              style={{
                position: 'absolute',
                left: `${tx}%`,
                top: `${ty}%`,
                transform: isZoomed
                  ? `rotate(0deg) scale(1.35) translate(-10%, -10%)`
                  : `rotate(${rot}deg)`,
                zIndex: zIdx,
                cursor: 'pointer',
                transition: 'transform .3s cubic-bezier(.25,.46,.45,.94), z-index 0s',
                background: 'white',
                borderRadius: 4,
                boxShadow: isZoomed ? '0 20px 60px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.4)',
                padding: '7px 7px 28px',
                width: 130,
              }}
            >
              {item.type === 'photo' ? (
                <img src={item.url} alt={item.ideaName} style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block', borderRadius: 2 }} loading="lazy" />
              ) : (
                <div style={{ width: '100%', height: 110, background: '#0a1a2e', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 2 }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(3,37,76,0.4)', borderRadius: 2 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75em' }}>▶</div>
                  </div>
                </div>
              )}
              {/* Polaroid caption */}
              <p style={{ margin: '6px 0 0', fontSize: '0.58em', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: '#444', textAlign: 'center', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.ideaName}
              </p>
              {item.rating > 0 && (
                <p style={{ margin: '2px 0 0', fontSize: '0.55em', color: '#f59e0b', textAlign: 'center' }}>{'★'.repeat(item.rating)}</p>
              )}
              {isZoomed && (
                <div style={{ position: 'absolute', bottom: -28, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: '0.65em', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>klik lagi untuk buka</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Secret message */}
      {group.trip?.secret_message && group.trip.secret_message !== 'Tidak ada pesan rahasia.' && (
        <div style={{ margin: '0 24px 20px', padding: '10px 16px', borderRadius: 12, background: 'rgba(255,251,235,0.12)', border: '1.5px solid rgba(252,211,77,0.4)', fontSize: '0.85em', color: '#fde68a', fontStyle: 'italic', flexShrink: 0 }}>
          💌 {group.trip.secret_message}
        </div>
      )}
    </div>
  )
}


// ── AUTO CAROUSEL ─────────────────────────────────────────────────────────────
function AutoCarousel({ items, onClickItem }: { items: MediaItem[]; onClickItem: (item: MediaItem) => void }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [sliding, setSliding] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragDeltaX, setDragDeltaX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const total = items.length

  // Auto-advance every 4s
  useEffect(() => {
    if (paused || total <= 1) return
    const t = setInterval(() => goTo((current + 1) % total), 4000)
    return () => clearInterval(t)
  }, [paused, current, total])

  // Handle slide change — autoplay video if current is video, else stop all
  useEffect(() => {
    const item = items[current]
    // Stop all other videos first
    Object.entries(videoRefs.current).forEach(([id, v]) => {
      if (v && id !== item.id) { v.pause(); v.currentTime = 0 }
    })
    if (item.type === 'video') {
      const vid = videoRefs.current[item.id]
      if (vid) {
        vid.muted = true
        vid.currentTime = 0
        vid.play().then(() => setPlayingVideo(item.id)).catch(() => setPlayingVideo(null))
      }
    } else {
      setPlayingVideo(null)
    }
  }, [current, items])

  function goTo(idx: number) {
    if (sliding) return
    const next = (idx + total) % total
    setSliding(true)
    setCurrent(next)
    setDragDeltaX(0)
    setTimeout(() => setSliding(false), 600)
  }

  // Pointer events for drag (works mouse + touch)
  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest('button')) return
    setIsDragging(true)
    setDragStartX(e.clientX)
    setDragDeltaX(0)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!isDragging) return
    setDragDeltaX(e.clientX - dragStartX)
  }
  function onPointerUp(e: React.PointerEvent) {
    if (!isDragging) return
    setIsDragging(false)
    const w = containerRef.current?.offsetWidth || 400
    if (Math.abs(dragDeltaX) > w * 0.2) {
      goTo(current + (dragDeltaX < 0 ? 1 : -1))
    } else {
      setDragDeltaX(0)
    }
  }

  async function handleVideoToggle(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    const vid = videoRefs.current[id]
    if (!vid) return
    if (playingVideo === id) {
      // Toggle mute on tap while playing
      vid.muted = !vid.muted
    } else {
      vid.muted = true
      vid.currentTime = 0
      try {
        await vid.play()
        setPlayingVideo(id)
        setPaused(true)
      } catch {}
    }
  }

  const item = items[current]
  const w = containerRef.current?.offsetWidth || 400
  const rawOffset = isDragging ? dragDeltaX : 0
  // translateX in px: each slide is exactly containerWidth wide
  const trackPx = -(current * w) + rawOffset

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', userSelect: 'none', touchAction: 'pan-y' }}
      onMouseEnter={() => { if (!isDragging) setPaused(true) }}
      onMouseLeave={() => { if (!isDragging) setPaused(false) }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Slide window */}
      <div style={{ position: 'relative', height: 320, overflow: 'hidden', background: P, cursor: isDragging ? 'grabbing' : 'grab' }}>

        {/* Track — absolute positioned, moves via px */}
        <div style={{
          position: 'absolute', top: 0, left: 0, height: '100%',
          width: `${total * 100}%`,
          transform: `translateX(${trackPx}px)`,
          transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform',
          display: 'flex',
        }}>
          {items.map((it, i) => {
            const isActive = i === current
            return (
              <div key={it.id} style={{ width: `${100 / total}%`, height: '100%', flexShrink: 0, position: 'relative', background: '#0a1a2e' }}>
                {it.type === 'photo' ? (
                  <>
                    {/* Blurred bg fill */}
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${it.url})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(18px)', transform: 'scale(1.1)', opacity: 0.5 }} />
                    <img
                      src={it.url}
                      alt={it.ideaName}
                      draggable={false}
                      onClick={() => { if (!isDragging && Math.abs(dragDeltaX) < 5) onClickItem(it) }}
                      style={{ position: 'relative', width: '100%', height: '100%', objectFit: 'contain', display: 'block', zIndex: 1 }}
                    />
                  </>
                ) : (
                  <div style={{ width: '100%', height: '100%', position: 'relative', background: '#000' }}>
                    {/* Blurred bg fill for video */}
                    <div style={{ position: 'absolute', inset: 0, background: '#0a1a2e' }} />
                    <video
                      ref={el => { videoRefs.current[it.id] = el }}
                      src={it.url}
                      style={{ position: 'relative', width: '100%', height: '100%', objectFit: 'contain', display: 'block', zIndex: 1 }}
                      playsInline
                      muted
                      preload="metadata"
                      onEnded={() => { goTo(current + 1); setPaused(false) }}
                    />
                    {/* Play/Pause overlay */}
                    <div
                      onClick={e => handleVideoToggle(e, it.id)}
                      style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: playingVideo === it.id ? 'transparent' : 'rgba(0,0,0,0.3)', transition: 'background .25s' }}
                    >
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.4)', opacity: playingVideo === it.id ? 0 : 1, transform: playingVideo === it.id ? 'scale(0.8)' : 'scale(1)', transition: 'all .25s' }}>
                        <span style={{ fontSize: '1.3em', marginLeft: 4, color: P }}>▶</span>
                      </div>
                      {playingVideo === it.id && (
                        <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: '3px 8px', fontSize: '0.72em', color: 'white', fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                          🔇 Tap untuk suara
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,37,76,0.8) 0%, transparent 50%)', pointerEvents: 'none', zIndex: 3, opacity: playingVideo === item.id ? 0 : 1, transition: 'opacity .3s' }} />

        {/* Info bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px', pointerEvents: 'none', zIndex: 4, opacity: playingVideo === item.id ? 0 : 1, transition: 'opacity .3s' }}>
          <p style={{ color: 'white', fontWeight: 800, fontSize: '0.88em', margin: '0 0 3px', textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>{item.ideaName}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {item.rating > 0 && <span style={{ color: '#f59e0b', fontSize: '0.75em' }}>{'★'.repeat(item.rating)}</span>}
            {item.reviewText && <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.72em', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>"{item.reviewText}"</span>}
          </div>
        </div>

        {/* Arrows */}
        {total > 1 && !isDragging && (
          <>
            <button onClick={e => { e.stopPropagation(); goTo(current - 1); setPaused(true); setTimeout(() => setPaused(false), 2500) }}
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: '50%', width: 38, height: 38, color: 'white', fontSize: '1.2em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5, transition: 'background .15s' }}>‹</button>
            <button onClick={e => { e.stopPropagation(); goTo(current + 1); setPaused(true); setTimeout(() => setPaused(false), 2500) }}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: '50%', width: 38, height: 38, color: 'white', fontSize: '1.2em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5, transition: 'background .15s' }}>›</button>
          </>
        )}

        {/* Video badge */}
        {item.type === 'video' && playingVideo !== item.id && (
          <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(3,37,76,0.85)', color: 'white', borderRadius: 6, padding: '3px 9px', fontSize: '0.7em', fontWeight: 700, zIndex: 5 }}>🎬 Video</div>
        )}
      </div>

      {/* Dot indicators + progress bar */}
      {total > 1 && (
        <div style={{ padding: '10px 16px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Progress bar */}
          <div style={{ flex: 1, height: 3, background: S, borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: P, borderRadius: 99, width: `${((current + 1) / total) * 100}%`, transition: 'width .3s ease' }} />
          </div>
          {/* Counter */}
          <span style={{ fontSize: '0.72em', color: MUTED, fontWeight: 700, flexShrink: 0 }}>{current + 1} / {total}</span>
          {/* Dots */}
          <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
            {items.map((_, i) => (
              <button key={i} onClick={() => { goTo(i); setPaused(true); setTimeout(() => setPaused(false), 2000) }}
                style={{ width: i === current ? 18 : 7, height: 7, borderRadius: 99, background: i === current ? P : S, border: 'none', cursor: 'pointer', padding: 0, transition: 'all .3s ease' }} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


function MediaCard({ item, onClick }: { item: MediaItem; onClick: () => void }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className="media-card" onClick={onClick} style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', background: S, boxShadow: '0 2px 8px rgba(3,37,76,0.08)', transition: 'all 0.25s ease', border: '2px solid transparent' }}>
      {item.type === 'photo' ? (
        <div style={{ position: 'relative' }}>
          <img src={item.url} alt={item.ideaName} onLoad={() => setLoaded(true)} style={{ width: '100%', display: 'block', verticalAlign: 'bottom', opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }} loading="lazy" />
          {!loaded && <div style={{ paddingTop: '75%', background: `linear-gradient(135deg, ${S}, ${BGM})`, position: 'relative' }}><span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5em' }}>📷</span></div>}
        </div>
      ) : (
        <div style={{ position: 'relative', paddingTop: '56.25%', background: '#001a33' }}>
          <video src={item.url} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(3,37,76,0.3)', zIndex: 1 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1em', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>▶</div>
          </div>
        </div>
      )}
      <div className="hover-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,37,76,0.88) 0%, rgba(3,37,76,0.1) 55%, transparent 100%)', opacity: 0, transition: 'opacity 0.25s ease', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '10px 12px' }}>
        <p style={{ color: 'white', fontWeight: 800, fontSize: '0.82em', margin: '0 0 3px', lineHeight: 1.3 }}>{item.ideaName}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {item.rating > 0 && <span style={{ color: '#f59e0b', fontSize: '0.75em' }}>{'★'.repeat(item.rating)}</span>}
          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.72em' }}>{item.reviewerName}</span>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 5 }}>
        {item.type === 'video' && <span style={{ background: 'rgba(3,37,76,0.85)', color: 'white', borderRadius: 6, padding: '2px 7px', fontSize: '0.68em', fontWeight: 700 }}>🎬</span>}
        {item.rating > 0 && <span style={{ background: 'rgba(245,158,11,0.9)', color: 'white', borderRadius: 6, padding: '2px 7px', fontSize: '0.68em', fontWeight: 700 }}>★ {item.rating}</span>}
      </div>
    </div>
  )
}