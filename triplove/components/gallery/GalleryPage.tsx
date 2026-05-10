'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Navbar from '@/components/ui/Navbar'
import { useData } from '@/context/DataContext'
import { supabase } from '@/lib/supabase'
import { getPublicImageUrl, getPublicVideoUrl, formatTanggalIndonesia } from '@/lib/utils'
import type { IdeaReview, TripHistory } from '@/types/types'

const P = '#03254c', S = '#c4e8ff', BG = '#d0efff', BGM = '#e1f3ff', MUTED = '#a0a0b5'

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
  id: string; type: 'photo' | 'video'; url: string
  reviewerName: string; rating: number; reviewText: string
  ideaName: string; categoryName: string
  tripDate?: string; tripDay?: string; tripId?: string
}
interface TripGroup { trip: TripHistory; media: MediaItem[] }
interface DiaryNote { id: string; trip_id: string; content: string; created_at: string }
type ViewMode = 'masonry' | 'timeline' | 'moodboard'

export default function GalleryPage() {
  const { ideas, reviews, loading, loadAllData } = useData()
  const [trips, setTrips] = useState<Record<string, TripHistory>>({})
  const [diaryNotes, setDiaryNotes] = useState<DiaryNote[]>([])
  const [filter, setFilter] = useState<'all' | 'photo' | 'video'>('all')
  const [filterCat, setFilterCat] = useState('all')
  const [search, setSearch] = useState('')
  const [lightbox, setLightbox] = useState<MediaItem | null>(null)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const [diaryGroup, setDiaryGroup] = useState<TripGroup | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('timeline')
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

  const refreshNotes = useCallback(() => {
    supabase.from('diary_notes').select('*').then(({ data }) => {
      if (data) setDiaryNotes(data as DiaryNote[])
    })
  }, [])

  useEffect(() => {
    loadAllData()
    supabase.from('trip_history').select('*').then(({ data }) => {
      const map: Record<string, TripHistory> = {}
      ;(data || []).forEach((t: any) => { map[t.id] = t })
      setTrips(map)
    })
    refreshNotes()
  }, [])

  const allMedia = useMemo<MediaItem[]>(() => {
    const items: MediaItem[] = []
    reviews.forEach(r => {
      const idea = ideas.find(i => i.id === r.idea_id)
      const trip = r.trip_id ? trips[r.trip_id] : undefined
      const base = {
        id: r.id, reviewerName: r.reviewer_name || 'Anonim', rating: r.rating || 0,
        reviewText: r.review_text || '', ideaName: idea?.idea_name || 'Aktivitas',
        categoryName: idea?.category_name || '', tripDate: trip?.trip_date,
        tripDay: trip?.trip_day, tripId: r.trip_id || undefined,
      }
      const photos = Array.isArray(r.photo_url) ? r.photo_url : r.photo_url ? [r.photo_url] : []
      photos.forEach((url, i) => items.push({ ...base, id: `${r.id}-p${i}`, type: 'photo', url: getPublicImageUrl(url) }))
      if (r.video_url) { const vurl = getPublicVideoUrl(r.video_url); if (vurl) items.push({ ...base, id: `${r.id}-v`, type: 'video', url: vurl }) }
    })
    return items.reverse()
  }, [reviews, ideas, trips])

  const categories = useMemo(() => ['all', ...Array.from(new Set(allMedia.map(m => m.categoryName).filter(Boolean)))], [allMedia])

  // Check if the search text looks like a trip date/day (e.g. "minggu", "januari", "2025")
  // If so, don't filter media by text — just show everything and let the date dropdown handle navigation
  const isDateSearch = useMemo(() => {
    if (!search.trim()) return false
    const q = search.toLowerCase()
    return Object.values(trips).some(t => {
      const td = (t as TripHistory)
      return (td.trip_date || '').includes(q) ||
        (td.trip_day || '').toLowerCase().includes(q) ||
        formatTanggalIndonesia(td.trip_date || '').toLowerCase().includes(q)
    })
  }, [search, trips])

  const filtered = useMemo(() => allMedia.filter(m => {
    if (filter !== 'all' && m.type !== filter) return false
    if (filterCat !== 'all' && m.categoryName !== filterCat) return false
    if (search && !isDateSearch) { const q = search.toLowerCase(); return m.ideaName.toLowerCase().includes(q) || m.reviewerName.toLowerCase().includes(q) || m.reviewText.toLowerCase().includes(q) }
    return true
  }), [allMedia, filter, filterCat, search, isDateSearch])

  const tripGroups = useMemo<TripGroup[]>(() => {
    const map: Record<string, TripGroup> = {}
    filtered.forEach(m => {
      const key = m.tripId || '__no_trip__'
      if (!map[key]) { const trip = m.tripId ? trips[m.tripId] : null; map[key] = { trip: trip as TripHistory, media: [] } }
      map[key].media.push(m)
    })
    return Object.values(map).filter(g => g.media.length > 0).sort((a, b) => {
      if (!a.trip?.trip_date) return 1; if (!b.trip?.trip_date) return -1
      return b.trip.trip_date.localeCompare(a.trip.trip_date)
    })
  }, [filtered, trips])

  const openLightbox = useCallback((item: MediaItem) => { setLightbox(item); setLightboxIdx(filtered.indexOf(item)) }, [filtered])
  const navLightbox = useCallback((dir: 1 | -1) => {
    const next = lightboxIdx + dir
    if (next < 0 || next >= filtered.length) return
    setLightbox(filtered[next]); setLightboxIdx(next)
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

  const columns = useMemo(() => { const cols: MediaItem[][] = [[], []]; filtered.forEach((item, i) => cols[i % 2].push(item)); return cols }, [filtered])

  function addTrack() {
    if (!newTrackTitle || !newTrackUrl) return
    const embedUrl = newTrackUrl.includes('youtube.com/watch?v=') ? newTrackUrl.replace('watch?v=', 'embed/') + '?autoplay=1&controls=0'
      : newTrackUrl.includes('youtu.be/') ? 'https://www.youtube.com/embed/' + newTrackUrl.split('youtu.be/')[1] + '?autoplay=1&controls=0' : newTrackUrl
    setPlaylist(prev => [...prev, { title: newTrackTitle, artist: newTrackArtist, url: embedUrl }])
    setNewTrackTitle(''); setNewTrackArtist(''); setNewTrackUrl(''); setShowAddTrack(false)
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
        @keyframes scrollFilm{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes filmGlow{0%,100%{opacity:0.6}50%{opacity:1}}
        .media-card:hover .hover-overlay{opacity:1!important}
        .media-card:hover{transform:translateY(-4px)!important;box-shadow:0 12px 32px rgba(3,37,76,0.18)!important}
        .moodboard-card{animation:fadeIn 0.4s ease both;animation-delay:var(--delay,0s)}
        .player-btn:hover{background:rgba(255,255,255,0.2)!important}
        .track-item:hover{background:${BGM}!important}
        .film-frame-item .film-hover-overlay{opacity:0}.film-frame-item:hover .film-hover-overlay{opacity:1!important}.film-frame-item:hover img,.film-frame-item:hover video{opacity:1!important}
        .film-roll-card:hover{transform:translateY(-4px) scale(1.02)}.film-roll-card:hover .roll-play-btn{opacity:1!important}.film-roll-card:hover .roll-play-icon{background:rgba(0,0,0,0.15)!important}
        .cassette-item:hover{transform:translateY(-10px) scale(1.04);filter:brightness(1.12);z-index:10}
        .cassette-item:active{transform:translateY(-4px) scale(0.98)}
      `}} />
      <Navbar />
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 16px 120px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '2.4em', color: P, margin: '0 0 6px', letterSpacing: '-0.5px' }}>📸 Galeri Kenangan</h1>
          <p style={{ color: MUTED, margin: '0 0 4px', fontSize: '0.92em' }}>Semua momen indah kalian berdua</p>
          <p style={{ color: P, fontWeight: 700, fontSize: '0.88em' }}>{allMedia.filter(m=>m.type==='photo').length} foto · {allMedia.filter(m=>m.type==='video').length} video · {tripGroups.length} trip</p>
        </div>

        <div style={{ background: 'white', borderRadius: 20, border: `2px solid ${S}`, padding: '14px 18px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 4, background: BGM, borderRadius: 12, padding: 4 }}>
              {([['timeline','🕐 Timeline'],['moodboard','🎞️ Moodboard'],['masonry','⊞ Grid']] as [ViewMode,string][]).map(([v,l]) => (
                <button key={v} onClick={() => setViewMode(v)} style={{ padding: '6px 14px', borderRadius: 9, border: 'none', fontWeight: 700, fontSize: '0.8em', cursor: 'pointer', background: viewMode === v ? P : 'transparent', color: viewMode === v ? 'white' : MUTED, transition: 'all .2s' }}>{l}</button>
              ))}
            </div>
            <div style={{ width: 1, height: 28, background: S }} />
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
          <div style={{ display: 'flex', gap: 10 }}>
            {columns.map((col, ci) => (
              <div key={ci} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.map(item => <MediaCard key={item.id} item={item} onClick={() => openLightbox(item)} />)}
              </div>
            ))}
          </div>
        ) : viewMode === 'timeline' ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <DiaryBook tripGroups={tripGroups} ideas={ideas} diaryNotes={diaryNotes} onRefreshNotes={refreshNotes} onOpenDiary={g => setDiaryGroup(g)} diaryGroup={diaryGroup} onCloseDiary={() => setDiaryGroup(null)} onOpenLightbox={openLightbox} search={search} onSearchChange={setSearch} />
          </div>
        ) : (
          <FilmStripMoodboard tripGroups={tripGroups} onClickItem={openLightbox} />
        )}
      </main>

      {/* Music Player */}
      <div style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
        {showPlaylist && (
          <div style={{ background: 'white', borderRadius: 20, border: `2px solid ${S}`, boxShadow: '0 8px 32px rgba(3,37,76,0.18)', width: 'min(300px, 90vw)', overflow: 'hidden', animation: 'floatIn .25s ease' }}>
            <div style={{ padding: '14px 16px', borderBottom: `1.5px solid ${S}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, color: P, fontSize: '0.9em' }}>🎵 Playlist</span>
              <button onClick={() => setShowAddTrack(p => !p)} style={{ padding: '4px 10px', borderRadius: 8, background: showAddTrack ? P : BGM, color: showAddTrack ? 'white' : P, border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.75em' }}>+ Tambah</button>
            </div>
            {showAddTrack && (
              <div style={{ padding: '12px 16px', borderBottom: `1.5px solid ${S}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input value={newTrackTitle} onChange={e => setNewTrackTitle(e.target.value)} placeholder="Judul lagu *" style={{ padding: '7px 10px', borderRadius: 8, border: `1.5px solid ${S}`, fontSize: '0.82em', color: P, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                <input value={newTrackArtist} onChange={e => setNewTrackArtist(e.target.value)} placeholder="Artis" style={{ padding: '7px 10px', borderRadius: 8, border: `1.5px solid ${S}`, fontSize: '0.82em', color: P, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                <input value={newTrackUrl} onChange={e => setNewTrackUrl(e.target.value)} placeholder="YouTube URL *" style={{ padding: '7px 10px', borderRadius: 8, border: `1.5px solid ${S}`, fontSize: '0.82em', color: P, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                <button onClick={addTrack} style={{ padding: '7px', borderRadius: 8, background: P, color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.82em' }}>Tambah ke Playlist</button>
              </div>
            )}
            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
              {playlist.map((t, i) => (
                <div key={i} className="track-item" onClick={() => { setCurrentTrack(i); setIsPlaying(true) }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer', background: i === currentTrack ? BGM : 'white', transition: 'background .15s', borderBottom: `1px solid ${S}` }}>
                  <span style={{ fontSize: '0.75em', color: i === currentTrack && isPlaying ? P : MUTED, fontWeight: 700, width: 18, flexShrink: 0 }}>{i === currentTrack && isPlaying ? '▶' : i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, color: P, fontSize: '0.82em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</p>
                    <p style={{ margin: 0, color: MUTED, fontSize: '0.72em' }}>{t.artist}</p>
                  </div>
                  {i === currentTrack && isPlaying && <span style={{ animation: 'pulse 1s infinite', fontSize: '0.7em' }}>🎵</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ background: P, borderRadius: 999, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 6px 24px rgba(3,37,76,0.35)', minWidth: showPlayer ? 'min(260px, 80vw)' : 'auto', transition: 'all .3s ease' }}>
          {showPlayer ? (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, color: 'white', fontWeight: 700, fontSize: '0.8em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.title}</p>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.7em' }}>{track.artist}</p>
              </div>
              <button className="player-btn" onClick={() => setCurrentTrack(p => (p - 1 + playlist.length) % playlist.length)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8em', transition: 'background .15s' }}>‹</button>
              <button className="player-btn" onClick={() => setIsPlaying(p => !p)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', transition: 'background .15s' }}>{isPlaying ? '⏸' : '▶'}</button>
              <button className="player-btn" onClick={() => setCurrentTrack(p => (p + 1) % playlist.length)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8em', transition: 'background .15s' }}>›</button>
              <button className="player-btn" onClick={() => setShowPlaylist(p => !p)} style={{ background: showPlaylist ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8em', transition: 'background .15s' }}>☰</button>
              <button className="player-btn" onClick={() => { setShowPlayer(false); setIsPlaying(false); setShowPlaylist(false) }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7em', transition: 'background .15s' }}>✕</button>
            </>
          ) : (
            <button onClick={() => setShowPlayer(true)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.85em', padding: 0 }}>🎵 <span>Musik</span></button>
          )}
        </div>
      </div>

      {isPlaying && <iframe ref={iframeRef} src={track.url} style={{ position: 'fixed', width: 0, height: 0, border: 'none', opacity: 0, pointerEvents: 'none' }} allow="autoplay" title="music-player" />}

      {lightbox && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(3,37,76,0.96)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setLightbox(null) }}>
          {lightboxIdx > 0 && <button onClick={() => navLightbox(-1)} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 48, height: 48, fontSize: '1.4em', cursor: 'pointer', color: 'white', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>}
          {lightboxIdx < filtered.length - 1 && <button onClick={() => navLightbox(1)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 48, height: 48, fontSize: '1.4em', cursor: 'pointer', color: 'white', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>}
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: '1.1em', cursor: 'pointer', color: 'white', zIndex: 10 }}>✕</button>
          <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.6)', fontSize: '0.82em', fontWeight: 600 }}>{lightboxIdx + 1} / {filtered.length}</div>
          <div style={{ maxWidth: 760, width: '100%', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            {lightbox.type === 'photo' ? <img src={lightbox.url} alt={lightbox.ideaName} style={{ width: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: 20, display: 'block' }} /> : <video src={lightbox.url} controls autoPlay style={{ width: '100%', maxHeight: '65vh', borderRadius: 20, background: '#000' }} />}
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

// ── DIARY BOOK — single page, no left memo panel ──────────────────────────────
function DiaryBook({ tripGroups, ideas, diaryNotes, onRefreshNotes, onOpenDiary, diaryGroup, onCloseDiary, onOpenLightbox, search, onSearchChange }: {
  tripGroups: TripGroup[]; ideas: any[]; diaryNotes: DiaryNote[]; onRefreshNotes: () => void
  onOpenDiary: (g: TripGroup) => void; diaryGroup: TripGroup | null; onCloseDiary: () => void; onOpenLightbox: (item: MediaItem) => void
  search: string; onSearchChange: (v: string) => void
}) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const [flippedCount, setFlippedCount] = useState(0)
  const [animating, setAnimating] = useState(false)

  // Trip date autocomplete — matches against the shared search prop
  const tripDateMatches = useMemo(() => {
    if (!search.trim()) return []
    const q = search.toLowerCase()
    return tripGroups.filter(g => {
      const date = g.trip?.trip_date || ''; const day = g.trip?.trip_day || ''
      return date.includes(q) || day.toLowerCase().includes(q) || formatTanggalIndonesia(date).toLowerCase().includes(q)
    })
  }, [search, tripGroups])

  function flipForward() {
    if (animating || flippedCount >= tripGroups.length) return
    setAnimating(true); setFlippedCount(c => c + 1); setTimeout(() => setAnimating(false), 700)
  }
  function flipBackward() {
    if (animating || flippedCount <= 0) return
    setAnimating(true); setFlippedCount(c => c - 1); setTimeout(() => setAnimating(false), 700)
  }
  function jumpToTrip(g: TripGroup) {
    const idx = tripGroups.findIndex(t => t.trip?.id === g.trip?.id)
    if (idx === -1) return
    setFlippedCount(idx); onSearchChange('')
  }

  const bookW = isMobile ? 320 : 440
  const bookH = isMobile ? 480 : 560

  return (
    <>
      <style>{`
        .diary-page {
          position: absolute; width: 100%; height: 100%; top: 0; left: 0;
          transform-origin: left center; transform-style: preserve-3d;
          transition: transform 0.9s cubic-bezier(0.645, 0.045, 0.355, 1);
          cursor: pointer; will-change: transform;
        }
        .diary-page.is-flipped { transform: rotateY(-180deg); }
        .diary-page-front, .diary-page-back {
          position: absolute; width: 100%; height: 100%; top: 0; left: 0;
          backface-visibility: hidden; -webkit-backface-visibility: hidden;
          overflow: hidden; transform: translateZ(0); -webkit-transform: translateZ(0); isolation: isolate;
        }
        .diary-page-back {
          transform: rotateY(180deg) translateZ(0); -webkit-transform: rotateY(180deg) translateZ(0);
          background: #f4f1de; border-radius: 10px;
        }
        .diary-ruled-lines { position: absolute; inset: 0; pointer-events: none; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>

        {/* Trip date autocomplete dropdown — appears when search matches a trip date */}
        {tripDateMatches.length > 0 && (
          <div style={{ width: '100%', maxWidth: bookW, position: 'relative' }}>
            <div style={{ background: 'white', borderRadius: 14, boxShadow: '0 8px 32px rgba(3,37,76,0.18)', border: `1.5px solid ${S}`, zIndex: 50, maxHeight: 240, overflowY: 'auto' }}>
              <div style={{ padding: '8px 16px 6px', fontSize: '0.7em', color: MUTED, fontWeight: 700, letterSpacing: '0.05em', borderBottom: `1px solid ${BGM}` }}>Langsung ke tanggal:</div>
              {tripDateMatches.map(g => (
                <button key={g.trip?.id} onClick={() => jumpToTrip(g)} style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', borderBottom: `1px solid ${BGM}`, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: P, fontSize: '0.85em' }}>{g.trip?.trip_day}, {formatTanggalIndonesia(g.trip?.trip_date || '')}</div>
                    <div style={{ fontSize: '0.7em', color: MUTED }}>{g.media.length} foto</div>
                  </div>
                  <span style={{ color: P, fontSize: '0.9em' }}>→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* THE BOOK */}
        <div style={{
          position: 'relative',
          width: bookW,
          height: bookH,
          perspective: '2000px',
          boxShadow: '0 24px 48px rgba(3,37,76,0.22), 0 8px 20px rgba(3,37,76,0.14)',
        }}>
          {/* Dark back base */}
          <div style={{ position: 'absolute', inset: 0, background: '#2d1e16', borderRadius: 10 }} />

          {/* Pages — rendered back to front so z-index works */}
          {[...tripGroups].reverse().map((group, revIdx) => {
            const idx = tripGroups.length - 1 - revIdx
            const isFlipped = idx < flippedCount
            const zIdx = isFlipped ? idx + 1 : tripGroups.length - idx + 1

            return (
              <div
                key={group.trip?.id || idx}
                className={`diary-page${isFlipped ? ' is-flipped' : ''}`}
                style={{ zIndex: zIdx, pointerEvents: idx === flippedCount ? 'auto' : 'none' }}
              >
                {/* Front face */}
                <div className="diary-page-front" style={{ background: idx % 2 === 0 ? '#fdfaf5' : '#fefcf8', borderRadius: '10px', cursor: 'default' }}>
                  <div className="diary-ruled-lines">
                    {Array.from({length: 22}).map((_,i) => (
                      <div key={i} style={{ position: 'absolute', left: 40, right: 16, top: 36 + i * 24, height: 1, background: 'rgba(180,160,120,0.18)' }} />
                    ))}
                    <div style={{ position: 'absolute', left: 34, top: 0, bottom: 0, width: 2, background: 'rgba(220,60,60,0.2)' }} />
                  </div>
                  <div style={{ position: 'absolute', inset: 0, padding: '20px 16px 48px 44px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <BookPage group={group} ideas={ideas} notes={diaryNotes.filter(n => n.trip_id === group.trip?.id)} onRefreshNotes={onRefreshNotes} onClick={() => onOpenDiary(group)} />
                  </div>
                  {/* Flip zone */}
                  <div onClick={flipForward} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 16, cursor: 'pointer', background: 'linear-gradient(to top, rgba(200,180,140,0.12), transparent)' }}>
                    <span style={{ fontSize: '0.62em', color: '#b8a88a', fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>{idx + 1} · balik halaman ›</span>
                  </div>
                </div>
                {/* Back face */}
                <div className="diary-page-back" />
              </div>
            )
          })}

          {/* Cover */}
          <div className={`diary-page${flippedCount > 0 ? ' is-flipped' : ''}`} style={{ zIndex: flippedCount > 0 ? 0 : tripGroups.length + 10, cursor: 'pointer' }} onClick={() => flippedCount === 0 ? flipForward() : undefined}>
            <div className="diary-page-front" style={{ background: 'linear-gradient(135deg, #2d1e16 0%, #4a3728 100%)', borderRadius: '10px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, padding: 32 }}>
                <div style={{ border: '2px solid rgba(212,192,132,0.5)', padding: '24px 32px', borderRadius: 4, textAlign: 'center' }}>
                  <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '1.8em', color: '#f5e6c8', margin: '0 0 8px', fontWeight: 400 }}>Diary Kenangan</h1>
                  <p style={{ fontSize: '0.65em', letterSpacing: '0.25em', color: 'rgba(212,192,132,0.7)', margin: 0, textTransform: 'uppercase' }}>Momen indah kalian berdua</p>
                </div>
                <p style={{ fontSize: '0.65em', color: 'rgba(245,230,200,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 16 }}>Ketuk untuk membuka ›</p>
              </div>
            </div>
            <div className="diary-page-back" style={{ background: '#3a2618' }} />
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={flipBackward} disabled={flippedCount === 0 || animating} style={{ padding: '9px 20px', borderRadius: 999, background: flippedCount === 0 ? '#e8dcc8' : P, color: flippedCount === 0 ? '#b8a88a' : 'white', border: 'none', fontWeight: 700, cursor: flippedCount === 0 ? 'not-allowed' : 'pointer', fontSize: '0.85em', transition: 'all .2s', boxShadow: flippedCount === 0 ? 'none' : '0 4px 14px rgba(3,37,76,0.25)' }}>‹ Kembali</button>
          <span style={{ fontSize: '0.78em', color: MUTED, fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>{flippedCount === 0 ? 'Tutup' : `${flippedCount} / ${tripGroups.length}`}</span>
          <button onClick={flipForward} disabled={flippedCount >= tripGroups.length || animating} style={{ padding: '9px 20px', borderRadius: 999, background: flippedCount >= tripGroups.length ? '#e8dcc8' : P, color: flippedCount >= tripGroups.length ? '#b8a88a' : 'white', border: 'none', fontWeight: 700, cursor: flippedCount >= tripGroups.length ? 'not-allowed' : 'pointer', fontSize: '0.85em', transition: 'all .2s', boxShadow: flippedCount >= tripGroups.length ? 'none' : '0 4px 14px rgba(3,37,76,0.25)' }}>Buka ›</button>
        </div>
      </div>

      {diaryGroup && <DiaryModal group={diaryGroup} notes={diaryNotes.filter(n => n.trip_id === diaryGroup.trip?.id)} onRefreshNotes={onRefreshNotes} onClose={onCloseDiary} onOpenLightbox={onOpenLightbox} />}
    </>
  )
}

// ── BOOK PAGE (single trip on one diary page) ─────────────────────────────────
function BookPage({ group, ideas, notes, onRefreshNotes, onClick }: { group: TripGroup; ideas: any[]; notes: DiaryNote[]; onRefreshNotes: () => void; onClick: () => void }) {
  // Get unique places visited in this trip from selection_json
  const places: Array<{ id: string; name: string; photoUrl: string | null; size: number }> = useMemo(() => {
    const sel = (group.trip as any)?.selection_json || []
    const total = sel.length || group.media.length
    // Smaller sizes when more places
    const baseSize = total <= 3 ? 115 : total <= 5 ? 95 : total <= 8 ? 80 : 68
    const sizeVar = [0, -10, 10, -5, 8, -8, 5, -12, 12, -6]
    return sel.map((s: any, i: number) => {
      const idea = ideas.find((id: any) => id.id === s.id || id.idea_name === s.name)
      return {
        id: s.id || `place-${i}`,
        name: s.name || idea?.idea_name || 'Tempat',
        photoUrl: idea?.photo_url ? getPublicImageUrl(idea.photo_url) : null,
        size: baseSize + (sizeVar[i % sizeVar.length]),
      }
    })
  }, [group, ideas])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, cursor: 'pointer' }} onClick={onClick}>
      {/* Date header */}
      <div style={{ zIndex: 1 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '1.05em', color: '#5a3e2b', margin: '0 0 3px', fontWeight: 400 }}>
          {group.trip ? `${group.trip.trip_day}, ${formatTanggalIndonesia(group.trip.trip_date)}` : 'Kenangan'}
        </h3>
        <div style={{ width: 40, height: 2, background: '#c9a96e', borderRadius: 1, marginBottom: 5 }} />
        <p style={{ fontSize: '0.7em', color: '#9a7d5a', margin: 0 }}>{places.length} tempat · {group.media.length} foto</p>
      </div>

      {/* Scattered polaroids — random positions within page bounds */}
      <div style={{ flex: 1, position: 'relative', minHeight: 220, overflow: 'hidden' }}>
        {(places.length > 0 ? places : group.media.map((m, i) => {
          const total = group.media.length
          const base = total <= 3 ? 115 : total <= 5 ? 95 : total <= 8 ? 80 : 68
          return { id: m.id, name: m.ideaName, photoUrl: m.url, size: base + [0,-10,10,-5,8,-8,5,-12][i%8] }
        })).map((place, i) => {
          const w = place.size
          const h = Math.round(w * 0.8)
          function sr(seed: number, min: number, max: number) {
            const x = Math.sin(seed) * 10000; return min + (x - Math.floor(x)) * (max - min)
          }
          const lx = sr(i * 17 + 3, 2, 60)
          const ty = sr(i * 11 + 7, 4, 55)
          const rot = sr(i * 7 + 1, -15, 15)
          return (
            <div key={place.id} style={{
              position: 'absolute',
              left: `${lx}%`,
              top: `${ty}%`,
              transform: `rotate(${rot}deg)`,
              background: 'white',
              padding: '4px 4px 16px',
              borderRadius: 3,
              boxShadow: '0 3px 12px rgba(0,0,0,0.14)',
              zIndex: i + 1,
              width: w,
            }}>
              <div style={{ width: '100%', height: h, background: '#f0ece4', overflow: 'hidden', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {place.photoUrl
                  ? <img src={place.photoUrl} alt={place.name} draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
                  : <span style={{ fontSize: '1.2em' }}>📍</span>
                }
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.46em', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: '#6b5240', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{place.name}</p>
            </div>
          )
        })}
      </div>

      {/* Secret message sticky note */}
      {group.trip?.secret_message && group.trip.secret_message !== 'Tidak ada pesan rahasia.' && (
        <div style={{ background: '#fff9c4', padding: '7px 10px', borderRadius: 2, boxShadow: '2px 2px 6px rgba(0,0,0,0.12)', fontSize: '0.65em', color: '#5a4a00', fontStyle: 'italic', fontFamily: "'Playfair Display', serif", transform: 'rotate(-1deg)', alignSelf: 'flex-start', maxWidth: '85%' }}>
          💌 {group.trip.secret_message}
        </div>
      )}

      <p style={{ fontSize: '0.6em', color: '#c9b99a', textAlign: 'center', margin: 0, fontStyle: 'italic' }}>ketuk untuk lihat semua foto</p>
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
      onClick={e => { e.stopPropagation(); onClick() }}
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
// ── INLINE VIDEO ──────────────────────────────────────────────────────────────
function InlineVideo({ src }: { src: string }) {
  const [playing, setPlaying] = useState(false)
  const ref = useRef<HTMLVideoElement>(null)

  function toggle(e: React.MouseEvent) {
    e.stopPropagation()
    if (!ref.current) return
    if (playing) { ref.current.pause(); setPlaying(false) }
    else { ref.current.play(); setPlaying(true) }
  }

  return (
    <div style={{ width: '100%', height: 110, background: '#0a1a2e', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
      <video
        ref={ref}
        src={src}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        playsInline
        loop
        onEnded={() => setPlaying(false)}
      />
      <div
        onClick={toggle}
        style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: playing ? 'transparent' : 'rgba(3,37,76,0.35)', transition: 'background .2s', cursor: 'pointer' }}
      >
        {!playing && (
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
            <span style={{ fontSize: '0.8em', marginLeft: 2, color: P }}>▶</span>
          </div>
        )}
      </div>
    </div>
  )
}


// ── NOTE ADDER ────────────────────────────────────────────────────────────────
function NoteAdder({ tripId, onRefreshNotes, dark }: { tripId?: string; onRefreshNotes: () => void; dark?: boolean }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  if (!tripId) return null

  async function save() {
    if (!text.trim()) return
    setSaving(true)
    await supabase.from('diary_notes').insert({ trip_id: tripId, content: text.trim() })
    setText('')
    setOpen(false)
    setSaving(false)
    onRefreshNotes()
  }

  if (!open) return (
    <button
      onClick={e => { e.stopPropagation(); setOpen(true) }}
      style={{ padding: '5px 12px', borderRadius: 8, background: dark ? 'rgba(255,255,255,0.12)' : '#e8f0f8', border: dark ? '1px solid rgba(255,255,255,0.2)' : '1px dashed #b8c8d8', fontSize: '0.65em', color: dark ? 'rgba(255,255,255,0.7)' : '#5a7a9a', cursor: 'pointer', fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}
    >+ tambah catatan</button>
  )

  return (
    <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <input
        autoFocus
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setOpen(false) }}
        placeholder="Tulis catatan..."
        style={{ padding: '5px 10px', borderRadius: 8, border: dark ? '1px solid rgba(255,255,255,0.25)' : '1px solid #b8c8d8', fontSize: '0.72em', background: dark ? 'rgba(255,255,255,0.1)' : 'white', color: dark ? 'white' : '#333', outline: 'none', width: 180, fontFamily: 'inherit' }}
      />
      <button
        onClick={save} disabled={saving}
        style={{ padding: '5px 12px', borderRadius: 8, background: P, color: 'white', border: 'none', fontSize: '0.68em', cursor: 'pointer', fontWeight: 700 }}
      >{saving ? '...' : 'Simpan'}</button>
      <button
        onClick={() => setOpen(false)}
        style={{ padding: '5px 8px', borderRadius: 8, background: 'transparent', color: dark ? 'rgba(255,255,255,0.5)' : '#999', border: 'none', fontSize: '0.68em', cursor: 'pointer' }}
      >Batal</button>
    </div>
  )
}


function DiaryModal({ group, notes, onRefreshNotes, onClose, onOpenLightbox }: { group: TripGroup; notes: DiaryNote[]; onRefreshNotes: () => void; onClose: () => void; onOpenLightbox: (item: MediaItem) => void }) {
  function sr(seed: number, min: number, max: number) {
    const x = Math.sin(seed) * 10000; return min + (x - Math.floor(x)) * (max - min)
  }

  // Photo positions
  const [photoPos, setPhotoPos] = useState(() =>
    group.media.map((_, i) => ({ x: sr(i * 13 + 2, 5, 62), y: sr(i * 11 + 3, 8, 52), rot: sr(i * 7 + 1, -12, 12) }))
  )
  // Note positions (index = note index in notes array, stored as % of container)
  const [notePos, setNotePos] = useState<Array<{ x: number; y: number; rot: number }>>([])
  const [photoZ, setPhotoZ] = useState<number[]>(() => group.media.map((_, i) => i + 1))
  const [noteZ, setNoteZ] = useState<number[]>([])
  const maxZ = useRef(group.media.length + notes.length + 10)

  // Sync notePos when notes change — use note IDs as dependency for accuracy
  useEffect(() => {
    setNotePos(prev => notes.map((n, i) => prev[i] || { x: sr(i * 31 + 5, 8, 70), y: sr(i * 19 + 9, 10, 60), rot: sr(i * 13 + 3, -8, 8) }))
    setNoteZ(prev => notes.map((_, i) => prev[i] || (group.media.length + i + 1)))
  }, [notes.map(n => n.id).join(',')])

  type DragTarget = { kind: 'photo' | 'note'; idx: number }
  const dragging = useRef<DragTarget | null>(null)
  const dragStartMouse = useRef({ x: 0, y: 0 })
  const dragStartPos = useRef({ x: 0, y: 0 })
  const hasMoved = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const [zoomedItem, setZoomedItem] = useState<MediaItem | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)

  // Refresh notes when modal opens so we always have latest data
  useEffect(() => { onRefreshNotes() }, [])

  useEffect(() => {
    document.body.style.overflow = 'hidden'

    function getXY(e: MouseEvent | TouchEvent) {
      if ('touches' in e) return { x: e.touches[0]?.clientX ?? 0, y: e.touches[0]?.clientY ?? 0 }
      return { x: e.clientX, y: e.clientY }
    }

    function onMove(e: MouseEvent | TouchEvent) {
      if (!dragging.current) return
      const { x, y } = getXY(e)
      const dx = x - dragStartMouse.current.x
      const dy = y - dragStartMouse.current.y
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved.current = true
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const newX = Math.max(0, Math.min(82, dragStartPos.current.x + (dx / rect.width) * 100))
      const newY = Math.max(0, Math.min(74, dragStartPos.current.y + (dy / rect.height) * 100))
      const { kind, idx } = dragging.current
      if (kind === 'photo') setPhotoPos(prev => prev.map((p, i) => i === idx ? { ...p, x: newX, y: newY } : p))
      else setNotePos(prev => prev.map((p, i) => i === idx ? { ...p, x: newX, y: newY } : p))
    }
    function onEnd() { dragging.current = null }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onEnd)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onEnd)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }
  }, [])

  function startDrag(e: React.MouseEvent | React.TouchEvent, kind: 'photo' | 'note', idx: number, curPos: { x: number; y: number }) {
    e.preventDefault(); e.stopPropagation()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    dragging.current = { kind, idx }
    hasMoved.current = false
    dragStartMouse.current = { x: clientX, y: clientY }
    dragStartPos.current = { x: curPos.x, y: curPos.y }
    maxZ.current += 1
    if (kind === 'photo') setPhotoZ(prev => prev.map((z, i) => i === idx ? maxZ.current : z))
    else setNoteZ(prev => prev.map((z, i) => i === idx ? maxZ.current : z))
  }

  const memoColors = ['#fff9c4', '#d4f0c4', '#ffd6e0', '#c4e8ff', '#ffe4c4']

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(3,37,76,0.9)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '10px 12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0, flexWrap: 'wrap', gap: 6 }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400, fontSize: '1.2em', color: 'white', margin: '0 0 2px' }}>
            {group.trip ? `${group.trip.trip_day}, ${formatTanggalIndonesia(group.trip.trip_date)}` : 'Kenangan'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: '0.72em' }}>drag foto & memo · ketuk foto untuk zoom</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Add memo button */}
          <NoteAdder tripId={group.trip?.id} onRefreshNotes={onRefreshNotes} dark />
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 36, height: 36, color: 'white', fontSize: '1em', cursor: 'pointer', flexShrink: 0 }}>✕</button>
        </div>
      </div>

      {/* Secret message strip */}
      {group.trip?.secret_message && group.trip.secret_message !== 'Tidak ada pesan rahasia.' && (
        <div style={{ margin: '8px 20px 0', padding: '6px 14px', borderRadius: 8, background: 'rgba(255,251,235,0.1)', border: '1px solid rgba(252,211,77,0.3)', fontSize: '0.75em', color: '#fde68a', fontStyle: 'italic', flexShrink: 0 }}>
          💌 {group.trip.secret_message}
        </div>
      )}

      {/* Scatter canvas */}
      <div ref={containerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden', margin: '10px 0 0' }}>

        {/* Photos */}
        {group.media.map((item, i) => {
          const pos = photoPos[i] || { x: 5, y: 5, rot: 0 }
          return (
            <div
              key={item.id}
              onMouseDown={e => startDrag(e, 'photo', i, pos)}
              onTouchStart={e => startDrag(e, 'photo', i, pos)}
              onClick={e => { e.stopPropagation(); if (!hasMoved.current) setZoomedItem(item) }}
              style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, transform: `rotate(${pos.rot}deg)`, zIndex: photoZ[i], cursor: 'grab', background: 'white', borderRadius: 4, boxShadow: '0 5px 20px rgba(0,0,0,0.4)', padding: '7px 7px 22px', width: 'clamp(90px, 22vw, 130px)', userSelect: 'none', touchAction: 'none' }}
            >
              {item.type === 'photo'
                ? <div style={{ width: '100%', height: 108, background: '#f5f5f0', borderRadius: 2, overflow: 'hidden' }}><img src={item.url} alt={item.ideaName} draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} /></div>
                : <InlineVideo src={item.url} />
              }
              <p style={{ margin: '4px 0 0', fontSize: '0.54em', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: '#444', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.ideaName}</p>
              {item.rating > 0 && <p style={{ margin: '1px 0 0', fontSize: '0.52em', color: '#f59e0b', textAlign: 'center' }}>{'★'.repeat(item.rating)}</p>}
            </div>
          )
        })}

        {/* Memo sticky notes */}
        {notes.map((note, i) => {
          const pos = notePos[i] || { x: 30, y: 30, rot: 0 }
          const color = memoColors[i % memoColors.length]
          return (
            <div
              key={note.id}
              onMouseDown={e => startDrag(e, 'note', i, pos)}
              onTouchStart={e => startDrag(e, 'note', i, pos)}
              style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, transform: `rotate(${pos.rot}deg)`, zIndex: noteZ[i] || 1, cursor: 'grab', background: color, borderRadius: 2, boxShadow: '2px 4px 14px rgba(0,0,0,0.3)', padding: '10px 12px 10px', width: 130, userSelect: 'none', minHeight: 70, touchAction: 'none' }}
            >
              {/* Top tape strip */}
              <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', width: 40, height: 16, background: 'rgba(255,255,255,0.55)', borderRadius: 2, backdropFilter: 'blur(2px)' }} />
              <p style={{ margin: 0, fontSize: '0.72em', color: '#333', lineHeight: 1.5, fontFamily: "'Playfair Display', serif", fontStyle: 'italic', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{note.content}</p>
              <button
                onMouseDown={e => e.stopPropagation()}
                onClick={async e => { e.stopPropagation(); await supabase.from('diary_notes').delete().eq('id', note.id); onRefreshNotes() }}
                style={{ position: 'absolute', top: 4, right: 6, background: 'none', border: 'none', color: 'rgba(0,0,0,0.3)', cursor: 'pointer', fontSize: '0.8em', lineHeight: 1 }}
              >×</button>
            </div>
          )
        })}
      </div>

      {/* Zoom lightbox */}
      {zoomedItem && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }} onClick={() => setZoomedItem(null)}>
          <button onClick={() => setZoomedItem(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 40, height: 40, color: 'white', fontSize: '1.1em', cursor: 'pointer' }}>✕</button>
          <div style={{ maxWidth: 620, width: '100%' }} onClick={e => e.stopPropagation()}>
            {zoomedItem.type === 'photo'
              ? <img src={zoomedItem.url} alt={zoomedItem.ideaName} style={{ width: '100%', maxHeight: '72vh', objectFit: 'contain', borderRadius: 12, display: 'block' }} />
              : <video src={zoomedItem.url} controls autoPlay playsInline style={{ width: '100%', maxHeight: '72vh', borderRadius: 12, background: '#000', display: 'block' }} />
            }
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <p style={{ color: 'white', fontWeight: 700, margin: '0 0 4px' }}>{zoomedItem.ideaName}</p>
              {zoomedItem.rating > 0 && <span style={{ color: '#f59e0b' }}>{'★'.repeat(zoomedItem.rating)}</span>}
              {zoomedItem.reviewText && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85em', fontStyle: 'italic', marginTop: 6 }}>"{zoomedItem.reviewText}"</p>}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Review modal */}
      {showReviewForm && (
        <ReviewFormModal
          group={group}
          onClose={() => setShowReviewForm(false)}
        />
      )}
    </div>
  )
}

// ── REVIEW FORM MODAL ─────────────────────────────────────────────────────────
function ReviewFormModal({ group, onClose }: { group: TripGroup; onClose: () => void }) {
  const places = useMemo(() => {
    const sel = (group.trip as any)?.selection_json || []
    // Fallback: unique places from media
    if (sel.length === 0) {
      const seen = new Set<string>()
      return group.media.filter(m => { if (seen.has(m.ideaName)) return false; seen.add(m.ideaName); return true })
        .map(m => ({ id: m.tripId || m.id, name: m.ideaName, idea_id: m.id }))
    }
    return sel.map((s: any) => ({ id: s.id, name: s.name, idea_id: s.id }))
  }, [group])

  const [selectedIdeaId, setSelectedIdeaId] = useState(places[0]?.idea_id || '')
  const [reviewerName, setReviewerName] = useState('')
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [saving, setSaving] = useState(false)
  const [existing, setExisting] = useState<any>(null)
  const [loadingExisting, setLoadingExisting] = useState(false)

  // Load existing review when ideaId or reviewer changes
  useEffect(() => {
    if (!selectedIdeaId || !reviewerName.trim() || !group.trip?.id) { setExisting(null); return }
    setLoadingExisting(true)
    supabase.from('idea_reviews')
      .select('*')
      .eq('idea_id', selectedIdeaId)
      .eq('trip_id', group.trip.id)
      .eq('reviewer_name', reviewerName.trim())
      .maybeSingle()
      .then(({ data }) => {
        if (data) { setExisting(data); setRating(data.rating || 5); setReviewText(data.review_text || '') }
        else { setExisting(null); setRating(5); setReviewText('') }
        setLoadingExisting(false)
      })
  }, [selectedIdeaId, reviewerName, group.trip?.id])

  async function save() {
    if (!reviewerName.trim() || !selectedIdeaId || !group.trip?.id) return
    setSaving(true)
    const payload = { idea_id: selectedIdeaId, trip_id: group.trip.id, reviewer_name: reviewerName.trim(), rating, review_text: reviewText }
    if (existing) {
      await supabase.from('idea_reviews').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('idea_reviews').insert(payload)
    }
    setSaving(false)
    onClose()
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 'clamp(14px, 4vw, 28px)', width: '100%', maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '92vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: P, fontSize: '1.1em' }}>
            {existing ? 'Edit Review' : 'Tambah Review'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2em', cursor: 'pointer', color: MUTED }}>✕</button>
        </div>

        {/* Place picker */}
        <div>
          <label style={{ fontSize: '0.78em', fontWeight: 700, color: P, display: 'block', marginBottom: 6 }}>Tempat</label>
          <select value={selectedIdeaId} onChange={e => setSelectedIdeaId(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: `1.5px solid ${S}`, fontSize: '0.88em', color: P, background: 'white', outline: 'none' }}>
            {places.map((p: { id: string; name: string; idea_id: string }, i: number) => <option key={p.idea_id || i} value={p.idea_id}>{p.name}</option>)}
          </select>
        </div>

        {/* Reviewer name */}
        <div>
          <label style={{ fontSize: '0.78em', fontWeight: 700, color: P, display: 'block', marginBottom: 6 }}>Nama</label>
          <input
            value={reviewerName} onChange={e => setReviewerName(e.target.value)}
            placeholder="Nama kamu..."
            style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: `1.5px solid ${S}`, fontSize: '0.88em', outline: 'none', boxSizing: 'border-box' }}
          />
          {loadingExisting && <p style={{ fontSize: '0.7em', color: MUTED, margin: '4px 0 0' }}>Mengecek review sebelumnya...</p>}
          {existing && <p style={{ fontSize: '0.7em', color: '#10b981', margin: '4px 0 0' }}>✓ Review ditemukan — kamu bisa edit</p>}
        </div>

        {/* Rating */}
        <div>
          <label style={{ fontSize: '0.78em', fontWeight: 700, color: P, display: 'block', marginBottom: 6 }}>Rating</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setRating(n)}
                style={{ fontSize: '1.4em', background: 'none', border: 'none', cursor: 'pointer', opacity: n <= rating ? 1 : 0.3, transition: 'opacity .15s' }}>★</button>
            ))}
          </div>
        </div>

        {/* Review text */}
        <div>
          <label style={{ fontSize: '0.78em', fontWeight: 700, color: P, display: 'block', marginBottom: 6 }}>Ulasan</label>
          <textarea
            value={reviewText} onChange={e => setReviewText(e.target.value)}
            placeholder="Tulis ulasan kamu..."
            rows={3}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: `1.5px solid ${S}`, fontSize: '0.88em', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>

        <button
          onClick={save} disabled={saving || !reviewerName.trim()}
          style={{ padding: '12px', borderRadius: 12, background: P, color: 'white', border: 'none', fontWeight: 700, fontSize: '0.9em', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
        >{saving ? 'Menyimpan...' : existing ? 'Update Review' : 'Simpan Review'}</button>
      </div>
    </div>
  )
}



// ── FILM STRIP MOODBOARD ──────────────────────────────────────────────────────

// Warna kaset per index
const CASSETTE_COLORS = [
  { spine: '#c9563c', label: '#f5e6c8', accent: '#8b2e1a' },
  { spine: '#2d6a8f', label: '#e8f4fd', accent: '#1a3f5c' },
  { spine: '#5a7a3a', label: '#edf7e0', accent: '#2e4a18' },
  { spine: '#7b4f8e', label: '#f5e8ff', accent: '#4a2060' },
  { spine: '#c97c2a', label: '#fff3e0', accent: '#7a4510' },
  { spine: '#3a7a6a', label: '#e0f5f0', accent: '#1a4a3a' },
]

function FilmStrip({ group, onClickItem, onClose }: {
  group: TripGroup; onClickItem: (item: MediaItem) => void; onClose: () => void
}) {
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})
  const doubled = useMemo(() => [...group.media, ...group.media], [group.media])
  const duration = Math.max(30, group.media.length * 7)
  const [isMobileFS, setIsMobileFS] = useState(false)

  useEffect(() => {
    const check = () => setIsMobileFS(window.innerWidth < 640)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const vid = e.target as HTMLVideoElement
        if (e.isIntersecting) { vid.muted = true; vid.play().catch(() => {}) }
        else vid.pause()
      })
    }, { threshold: 0.3 })
    Object.values(videoRefs.current).forEach(v => { if (v) observer.observe(v) })
    return () => observer.disconnect()
  }, [doubled])

  const label = group.trip ? `${group.trip.trip_day}, ${formatTanggalIndonesia(group.trip.trip_date)}` : 'Kenangan'
  const sub = group.trip?.secret_message && group.trip.secret_message !== 'Tidak ada pesan rahasia.' ? group.trip.secret_message : `${group.media.length} foto`
  const frameW = isMobileFS ? 180 : 300
  const frameH = isMobileFS ? 160 : 240
  const holeCount = isMobileFS ? 30 : 50

  return (
    <div style={{ width: '100%', animation: 'floatIn .35s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px 14px', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: isMobileFS ? '1.1em' : '1.5em', color: P, margin: '0 0 2px', fontWeight: 400 }}>{label}</h3>
          <p style={{ margin: 0, fontSize: '0.78em', color: MUTED, fontStyle: 'italic' }}>{sub}</p>
        </div>
        <button onClick={onClose} style={{ background: 'white', border: `1.5px solid ${S}`, borderRadius: 999, padding: '6px 14px', color: P, fontWeight: 700, cursor: 'pointer', fontSize: '0.78em', display: 'flex', alignItems: 'center', gap: 5 }}>
          ‹ Lemari
        </button>
      </div>

      <div style={{ position: 'relative', width: '108%', left: '-4%', background: '#111', transform: 'rotate(-0.5deg)', boxShadow: '0 16px 50px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '0 8px', height: isMobileFS ? 20 : 26, alignItems: 'center' }}>
          {Array.from({ length: holeCount }).map((_, i) => (
            <div key={i} style={{ width: isMobileFS ? 10 : 15, height: isMobileFS ? 7 : 11, background: '#fffdf7', borderRadius: 2, opacity: 0.75, flexShrink: 0 }} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'stretch', animation: `scrollFilm ${duration}s linear infinite`, willChange: 'transform', padding: '6px 0' }}>
          {doubled.map((item, i) => (
            <div key={i} className="film-frame-item" onClick={() => onClickItem(item)}
              style={{ flexShrink: 0, width: frameW, height: frameH, position: 'relative', borderLeft: '2px solid #222', borderRight: '2px solid #222', cursor: 'pointer', overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.type === 'photo'
                ? <img src={item.url} alt={item.ideaName} style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.9 }} loading="lazy" />
                : <video ref={el => { videoRefs.current[`${item.id}-${i}`] = el }} src={item.url} style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.9 }} muted playsInline loop />
              }
              <div className="film-hover-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 55%)', opacity: 0, transition: 'opacity .25s', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '8px 10px' }}>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '0.75em', margin: '0 0 2px', fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>{item.ideaName}</p>
                {item.rating > 0 && <span style={{ color: '#f59e0b', fontSize: '0.65em' }}>{'★'.repeat(item.rating)}</span>}
              </div>
              {item.type === 'video' && <div style={{ position: 'absolute', top: 6, left: 7, background: 'rgba(0,0,0,0.65)', color: 'white', borderRadius: 4, padding: '2px 6px', fontSize: '0.6em', fontWeight: 700 }}>🎬</div>}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '0 8px', height: isMobileFS ? 20 : 26, alignItems: 'center' }}>
          {Array.from({ length: holeCount }).map((_, i) => (
            <div key={i} style={{ width: isMobileFS ? 10 : 15, height: isMobileFS ? 7 : 11, background: '#fffdf7', borderRadius: 2, opacity: 0.75, flexShrink: 0 }} />
          ))}
        </div>
      </div>
      <p style={{ textAlign: 'right', paddingRight: 8, marginTop: 10, fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '0.76em', color: MUTED }}>"Tumbuh bersama, selamanya..."</p>
    </div>
  )
}

// ── CASSETTE SHELF ─────────────────────────────────────────────────────────────
function CassetteShelf({ tripGroups, onClickItem }: { tripGroups: TripGroup[]; onClickItem: (item: MediaItem) => void }) {
  const [activeGroup, setActiveGroup] = useState<TripGroup | null>(null)
  const [isMob, setIsMob] = useState(false)

  useEffect(() => {
    const check = () => setIsMob(window.innerWidth < 640)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (activeGroup) {
    return (
      <div style={{ width: '100%', padding: '8px 0 20px', backgroundImage: 'radial-gradient(rgba(3,37,76,0.07) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        <FilmStrip group={activeGroup} onClickItem={onClickItem} onClose={() => setActiveGroup(null)} />
      </div>
    )
  }

  // How many cassettes per shelf row
  const perRow = isMob ? 4 : 7
  const rows: TripGroup[][] = []
  for (let i = 0; i < tripGroups.length; i += perRow) {
    rows.push(tripGroups.slice(i, i + perRow))
  }

  const cassetteW = isMob ? 52 : 72
  const cassetteH = isMob ? 100 : 136
  const shelfThickness = isMob ? 14 : 18
  const shelfGap = isMob ? 18 : 24

  return (
    <div style={{ width: '100%', padding: '16px 0 28px', backgroundImage: 'radial-gradient(rgba(3,37,76,0.07) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: isMob ? 20 : 28, paddingLeft: 4, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: isMob ? '1.6em' : '2em', color: P, fontWeight: 700 }}>Lemari Film</span>
        <span style={{ fontSize: '0.78em', color: MUTED, fontStyle: 'italic' }}>— pilih kaset untuk diputar</span>
      </div>

      {/* The wooden shelf */}
      <div style={{
        background: 'linear-gradient(135deg, #e8d5b0 0%, #d4b896 40%, #c9a87a 100%)',
        borderRadius: 12,
        padding: isMob ? '16px 12px' : '24px 20px',
        boxShadow: '0 8px 32px rgba(100,60,20,0.25), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 0 rgba(100,60,20,0.2)',
        border: '2px solid #b8925a',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Wood grain overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(139,90,43,0.04) 40px, rgba(139,90,43,0.04) 41px)', pointerEvents: 'none', borderRadius: 12 }} />

        {/* Shelf rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: shelfGap + shelfThickness, position: 'relative' }}>
          {rows.map((row, ri) => (
            <div key={ri} style={{ position: 'relative' }}>
              {/* Cassettes sitting on shelf */}
              <div style={{ display: 'flex', gap: isMob ? 6 : 10, alignItems: 'flex-end', paddingBottom: 0, flexWrap: 'nowrap', overflowX: isMob ? 'auto' : 'visible', paddingLeft: 4 }}>
                {row.map((group, gi) => {
                  const globalIdx = ri * perRow + gi
                  const colors = CASSETTE_COLORS[globalIdx % CASSETTE_COLORS.length]
                  const label = group.trip
                    ? `${group.trip.trip_day}, ${formatTanggalIndonesia(group.trip.trip_date)}`
                    : 'Kenangan'
                  const shortDate = group.trip?.trip_date
                    ? new Date(group.trip.trip_date).getFullYear().toString()
                    : ''
                  const thumb = group.media.find(m => m.type === 'photo') || group.media[0]

                  return (
                    <div
                      key={group.trip?.id || gi}
                      className="cassette-item"
                      onClick={() => setActiveGroup(group)}
                      title={label}
                      style={{
                        flexShrink: 0,
                        width: cassetteW,
                        height: cassetteH,
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'transform .2s ease, box-shadow .2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {/* Cassette body */}
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(160deg, ${colors.spine} 0%, ${colors.accent} 100%)`,
                        borderRadius: isMob ? '3px 3px 2px 2px' : '4px 4px 3px 3px',
                        boxShadow: `2px 3px 10px rgba(0,0,0,0.35), inset 1px 0 0 rgba(255,255,255,0.15), inset -1px 0 0 rgba(0,0,0,0.2)`,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        position: 'relative',
                      }}>
                        {/* Top accent strip */}
                        <div style={{ height: isMob ? 6 : 8, background: 'rgba(0,0,0,0.25)', flexShrink: 0 }} />

                        {/* Thumbnail window */}
                        <div style={{
                          margin: isMob ? '4px 4px' : '5px 6px',
                          flex: 1,
                          background: '#111',
                          borderRadius: 2,
                          overflow: 'hidden',
                          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          position: 'relative',
                        }}>
                          {thumb ? (
                            <img src={thumb.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
                          ) : (
                            <span style={{ fontSize: isMob ? '1em' : '1.3em', opacity: 0.4 }}>🎞️</span>
                          )}
                        </div>

                        {/* Label strip */}
                        <div style={{
                          background: colors.label,
                          margin: isMob ? '0 4px 4px' : '0 5px 5px',
                          borderRadius: 2,
                          padding: isMob ? '2px 3px' : '3px 5px',
                          flexShrink: 0,
                        }}>
                          <p style={{ margin: 0, fontSize: isMob ? '0.42em' : '0.5em', color: colors.accent, fontWeight: 800, fontFamily: "'Playfair Display', serif", fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
                            {group.trip ? `${group.trip.trip_day?.slice(0,3)}` : 'KEN'}
                          </p>
                          <p style={{ margin: 0, fontSize: isMob ? '0.38em' : '0.45em', color: colors.accent, opacity: 0.75, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.1 }}>
                            {shortDate}
                          </p>
                        </div>

                        {/* Bottom ridge */}
                        <div style={{ height: isMob ? 4 : 5, background: 'rgba(0,0,0,0.3)', flexShrink: 0 }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Wooden shelf plank */}
              <div style={{
                height: shelfThickness,
                background: 'linear-gradient(180deg, #a0713a 0%, #8b5e2a 50%, #7a4f1e 100%)',
                borderRadius: '0 0 4px 4px',
                boxShadow: '0 4px 12px rgba(80,40,10,0.35), inset 0 1px 0 rgba(255,220,160,0.3)',
                position: 'relative',
              }}>
                {/* Shelf edge highlight */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'rgba(255,220,150,0.4)', borderRadius: '2px 2px 0 0' }} />
                {/* Shelf wood grain */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(100,50,10,0.08) 20px, rgba(100,50,10,0.08) 21px)', borderRadius: '0 0 4px 4px' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Shelf back wall shadow */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(100,60,20,0.08) 0%, transparent 30%, transparent 70%, rgba(100,60,20,0.08) 100%)', borderRadius: 12, pointerEvents: 'none' }} />
      </div>

      <p style={{ textAlign: 'right', paddingRight: 4, marginTop: 12, fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '0.76em', color: MUTED }}>"Kenangan terbaik tersimpan rapi di sini..."</p>
    </div>
  )
}

function FilmStripMoodboard({ tripGroups, onClickItem }: { tripGroups: TripGroup[]; onClickItem: (item: MediaItem) => void }) {
  return <CassetteShelf tripGroups={tripGroups} onClickItem={onClickItem} />
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

  const [direction, setDirection] = useState(1) // 1 = forward, -1 = backward

  // Auto-advance every 4s — ping-pong (1-2-3-2-1)
  useEffect(() => {
    if (paused || total <= 1) return
    const t = setInterval(() => {
      setCurrent(prev => {
        let next = prev + direction
        let newDir = direction
        if (next >= total) { next = total - 2; newDir = -1 }
        else if (next < 0) { next = 1; newDir = 1 }
        setDirection(newDir)
        return next
      })
    }, 4000)
    return () => clearInterval(t)
  }, [paused, direction, total])

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
    const next = Math.max(0, Math.min(idx, total - 1))
    if (next === current) return
    setDirection(next > current ? 1 : -1)
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
    setTimeout(() => setPaused(false), 1500)
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
                      onEnded={() => {
                        const next = direction === 1 ? (current + 1 >= total ? current - 1 : current + 1) : (current - 1 < 0 ? current + 1 : current - 1)
                        goTo(next); setPaused(false)
                      }}
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