'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getPublicImageUrl } from '@/lib/utils'

const P = '#03254c', S = '#c4e8ff', BG = '#d0efff', BGM = '#e1f3ff', MUTED = '#a0a0b5'

const FALLBACK_EMOJIS = ['🌸','🦋','🌈','💎','🍓','🌙','⭐','🦄','🌺','🍦','🎀','🐱','🌻','🎸','🏖️','💌']

interface Card {
  id: number
  key: string
  isPhoto: boolean
  content: string
  flipped: boolean
  matched: boolean
}

interface Player { name: string; score: number; roundWins: number; color: string }

export default function MemoryMatchGame() {
  const [cards, setCards]           = useState<Card[]>([])
  const [selected, setSelected]     = useState<number[]>([])
  const [players, setPlayers]       = useState<Player[]>([
    { name: 'Player 1', score: 0, roundWins: 0, color: P },
    { name: 'Player 2', score: 0, roundWins: 0, color: '#ec4899' },
  ])
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [moves, setMoves]           = useState(0)
  const [gameOver, setGameOver]     = useState(false)
  const [checking, setChecking]     = useState(false)
  const [pairs, setPairs]           = useState(8)
  const [setup, setSetup]           = useState(true)
  const [names, setNames]           = useState(['', ''])
  const [lastMatch, setLastMatch]   = useState<string | null>(null)
  const [timer, setTimer]           = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [useGallery, setUseGallery] = useState(false)
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([])
  const [loadingPhotos, setLoadingPhotos] = useState(false)
  const [round, setRound]           = useState(1)

  useEffect(() => {
    async function loadPhotos() {
      setLoadingPhotos(true)
      const { data } = await supabase.from('idea_reviews').select('photo_url').not('photo_url', 'is', null)
      const urls: string[] = []
      ;(data || []).forEach((r: any) => {
        const photos = Array.isArray(r.photo_url) ? r.photo_url : r.photo_url ? [r.photo_url] : []
        photos.forEach((url: string) => { if (url) urls.push(getPublicImageUrl(url)) })
      })
      setGalleryPhotos([...new Set(urls)])
      setLoadingPhotos(false)
    }
    loadPhotos()
  }, [])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (timerActive && !gameOver) interval = setInterval(() => setTimer(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [timerActive, gameOver])

  // Init round — pertahankan roundWins, reset score per round
  const initRound = useCallback((numPairs: number, usePhotos: boolean, prevPlayers?: Player[]) => {
    let pool: { key: string; isPhoto: boolean; content: string }[] = []

    if (usePhotos && galleryPhotos.length > 0) {
      const shuffledPhotos = [...galleryPhotos].sort(() => Math.random() - 0.5)
      const photoCount = Math.min(numPairs, shuffledPhotos.length)
      for (let i = 0; i < photoCount; i++) pool.push({ key: `photo_${i}`, isPhoto: true, content: shuffledPhotos[i] })
      for (let i = photoCount; i < numPairs; i++) pool.push({ key: `emoji_${i}`, isPhoto: false, content: FALLBACK_EMOJIS[i % FALLBACK_EMOJIS.length] })
    } else {
      for (let i = 0; i < numPairs; i++) pool.push({ key: `emoji_${i}`, isPhoto: false, content: FALLBACK_EMOJIS[i % FALLBACK_EMOJIS.length] })
    }

    const doubled = [...pool, ...pool].sort(() => Math.random() - 0.5)
    const newCards: Card[] = doubled.map((item, idx) => ({ id: idx, ...item, flipped: false, matched: false }))
    setCards(newCards)
    setSelected([])
    setMoves(0)
    setGameOver(false)
    setCurrentPlayer(0)
    setLastMatch(null)
    setTimer(0)
    setTimerActive(false)
    setPairs(numPairs)

    // Reset score per round, roundWins tetap dari prevPlayers
    if (prevPlayers) {
      setPlayers(prevPlayers.map(p => ({ ...p, score: 0 })))
    } else {
      setPlayers(prev => prev.map(p => ({ ...p, score: 0, roundWins: 0 })))
    }
  }, [galleryPhotos])

  function startGame() {
    const p1 = names[0].trim() || 'Player 1'
    const p2 = names[1].trim() || 'Player 2'
    const newPlayers: Player[] = [
      { name: p1, score: 0, roundWins: 0, color: P },
      { name: p2, score: 0, roundWins: 0, color: '#ec4899' },
    ]
    setPlayers(newPlayers)
    setRound(1)
    initRound(pairs, useGallery, newPlayers)
    setSetup(false)
    setTimerActive(true)
  }

  function doRematch() {
    // roundWins sudah di-update saat game over, tinggal reset score
    setPlayers(prev => {
      const updated = prev.map(p => ({ ...p, score: 0 }))
      setRound(r => r + 1)
      initRound(pairs, useGallery, updated)
      setTimerActive(true)
      return updated
    })
  }

  function exitToSetup() {
    setSetup(true)
    setRound(1)
    setPlayers(prev => prev.map(p => ({ ...p, score: 0, roundWins: 0 })))
  }

  function handleFlip(idx: number) {
    if (checking || cards[idx].flipped || cards[idx].matched || selected.length >= 2) return
    const newCards = [...cards]
    newCards[idx] = { ...newCards[idx], flipped: true }
    setCards(newCards)
    const newSelected = [...selected, idx]
    setSelected(newSelected)

    if (newSelected.length === 2) {
      setMoves(m => m + 1)
      setChecking(true)
      const [a, b] = newSelected
      if (newCards[a].key === newCards[b].key) {
        setTimeout(() => {
          const matched = [...newCards]
          matched[a] = { ...matched[a], matched: true }
          matched[b] = { ...matched[b], matched: true }
          setCards(matched)
          setLastMatch(newCards[a].isPhoto ? '📸' : newCards[a].content)
          setPlayers(prev => prev.map((p, i) => i === currentPlayer
            ? { ...p, score: p.score + 1 }
            : p
          ))
          setSelected([])
          setChecking(false)
          if (matched.every(c => c.matched)) {
            // Game over — update roundWins untuk pemenang round
            setPlayers(prev => {
              // Hitung skor final round ini
              const finalScores = prev.map((p, i) =>
                i === currentPlayer ? { ...p, score: p.score + 1 } : p
              )
              // Tentukan pemenang round — update roundWins
              const s0 = finalScores[0].score, s1 = finalScores[1].score
              const final = finalScores.map((p, i) => ({
                ...p,
                roundWins: s0 !== s1 && ((i === 0 && s0 > s1) || (i === 1 && s1 > s0))
                  ? p.roundWins + 1
                  : p.roundWins
              }))
              return final
            })
            setGameOver(true)
            setTimerActive(false)
          }
        }, 600)
      } else {
        setTimeout(() => {
          const reset = [...newCards]
          reset[a] = { ...reset[a], flipped: false }
          reset[b] = { ...reset[b], flipped: false }
          setCards(reset)
          setSelected([])
          setChecking(false)
          setLastMatch(null)
          setCurrentPlayer(c => c === 0 ? 1 : 0)
        }, 900)
      }
    }
  }

  const cols = pairs <= 6 ? 3 : 4
  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`
  const winner = gameOver ? (players[0].score > players[1].score ? players[0] : players[0].score < players[1].score ? players[1] : null) : null
  const totalLeader = players[0].roundWins !== players[1].roundWins
    ? (players[0].roundWins > players[1].roundWins ? players[0] : players[1])
    : null

  if (setup) return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${BG}, ${BGM})`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 28, border: `2px solid ${S}`, padding: '36px 32px', maxWidth: 400, width: '100%', boxShadow: '0 16px 48px rgba(3,37,76,0.12)' }}>
        <Link href="/games" style={{ color: MUTED, fontSize: '0.85em', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>← Back</Link>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '3em', marginBottom: 8 }}>🎴</div>
          <h2 style={{ fontWeight: 900, color: P, margin: '0 0 6px' }}>Memory Match</h2>
          <p style={{ color: MUTED, margin: 0, fontSize: '0.9em' }}>Temukan semua pasangan kartu!</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[0, 1].map(i => (
            <div key={i}>
              <label style={{ fontSize: '0.8em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 6 }}>{i === 0 ? '💙' : '💗'} Nama Player {i+1}</label>
              <input value={names[i]} onChange={e => setNames(prev => { const n=[...prev]; n[i]=e.target.value; return n })} placeholder={`Player ${i+1}`} style={{ width: '100%', padding: '10px 14px', border: `2px solid ${S}`, borderRadius: 12, fontSize: '0.95em', color: P, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}

          <div style={{ padding: '12px 16px', borderRadius: 14, background: BGM, border: `2px solid ${useGallery ? P : S}`, cursor: 'pointer' }} onClick={() => setUseGallery(v => !v)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 800, color: P, fontSize: '0.9em' }}>📸 Pakai foto dari Gallery</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.75em', color: MUTED }}>
                  {loadingPhotos ? 'Loading...' : galleryPhotos.length > 0 ? `${galleryPhotos.length} foto tersedia` : 'Belum ada foto — akan pakai emoji'}
                </p>
              </div>
              <div style={{ width: 44, height: 24, borderRadius: 12, background: useGallery ? P : '#e5e7eb', position: 'relative', transition: 'all 0.2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 3, left: useGallery ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 8 }}>🎯 Jumlah Pasangan</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[6, 8, 12, 16].map(n => (
                <button key={n} onClick={() => setPairs(n)} style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: `2px solid ${pairs === n ? P : S}`, background: pairs === n ? P : 'white', color: pairs === n ? 'white' : P, fontWeight: 700, cursor: 'pointer', fontSize: '0.88em' }}>{n}</button>
              ))}
            </div>
            {useGallery && galleryPhotos.length < pairs && galleryPhotos.length > 0 && (
              <p style={{ margin: '6px 0 0', fontSize: '0.75em', color: '#f59e0b' }}>⚠️ Foto hanya {galleryPhotos.length}, sisanya pakai emoji</p>
            )}
          </div>

          <button onClick={startGame} style={{ padding: '14px', borderRadius: 14, background: `linear-gradient(135deg, ${P}, #1a4d7a)`, color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '1em', marginTop: 4, boxShadow: '0 4px 16px rgba(3,37,76,0.25)' }}>🎮 Mulai Game!</button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${BG}, ${BGM})`, padding: '16px 12px 80px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <Link href="/games" style={{ color: P, fontWeight: 700, textDecoration: 'none', fontSize: '0.9em' }}>← Games</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 800, color: P }}>🎴 Memory Match</span>
            {round > 1 && (
              <span style={{ fontSize: '0.72em', fontWeight: 700, color: 'white', background: P, borderRadius: 20, padding: '2px 10px' }}>Round {round}</span>
            )}
          </div>
          <span style={{ fontWeight: 700, color: MUTED, fontSize: '0.9em' }}>⏱ {formatTime(timer)}</span>
        </div>



        {/* Scoreboard per round */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center', marginBottom: 14 }}>
          {players.map((p, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 16, padding: '12px 14px', border: `2px solid ${currentPlayer === i && !gameOver ? p.color : S}`, boxShadow: currentPlayer === i && !gameOver ? `0 4px 16px ${p.color}30` : 'none', transition: 'all 0.3s', textAlign: i === 0 ? 'left' : 'right' }}>
              <p style={{ margin: 0, fontSize: '0.7em', fontWeight: 700, color: MUTED }}>{currentPlayer === i && !gameOver ? '▶ Giliran' : 'Menunggu'}</p>
              <p style={{ margin: '2px 0', fontWeight: 800, color: p.color, fontSize: '0.85em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
              <p style={{ margin: 0, fontWeight: 900, color: P, fontSize: '1.6em', lineHeight: 1 }}>{p.score}</p>
            </div>
          ))}
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 900, color: P, fontSize: '1.1em' }}>VS</p>
            <p style={{ margin: '3px 0 0', fontSize: '0.7em', color: MUTED }}>{moves} moves</p>
          </div>
        </div>

        {lastMatch && !gameOver && (
          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            <span style={{ display: 'inline-block', padding: '4px 16px', borderRadius: 999, background: '#d1fae5', color: '#065f46', fontWeight: 700, fontSize: '0.85em' }}>
              ✓ Match! {lastMatch} +1 untuk {players[currentPlayer].name}
            </span>
          </div>
        )}

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
          {cards.map((card, idx) => (
            <div key={card.id} onClick={() => handleFlip(idx)} style={{ borderRadius: 12, cursor: card.matched || card.flipped ? 'default' : 'pointer', perspective: 600 }}>
              <div style={{
                width: '100%', paddingTop: '100%', position: 'relative',
                transformStyle: 'preserve-3d',
                transform: card.flipped || card.matched ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transition: 'transform 0.35s ease',
              }}>
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: 12, background: `linear-gradient(135deg, ${P}, #1a4d7a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4em', border: '2px solid rgba(255,255,255,0.1)', boxShadow: '0 2px 8px rgba(3,37,76,0.2)' }}>💕</div>
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: 12, background: card.matched ? '#d1fae5' : 'white', border: `2px solid ${card.matched ? '#6ee7b7' : S}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {card.isPhoto
                    ? <img src={card.content} alt="memory" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : <span style={{ fontSize: '1.8em' }}>{card.content}</span>
                  }
                  {card.matched && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '1.5em' }}>✓</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(3,37,76,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 28, padding: '32px 24px', maxWidth: 360, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(3,37,76,0.25)' }}>
            <div style={{ fontSize: '2.8em', marginBottom: 8 }}>{winner ? '🏆' : '🤝'}</div>
            <h2 style={{ fontWeight: 900, color: P, margin: '0 0 4px', fontSize: '1.3em' }}>{winner ? `${winner.name} Menang!` : 'Seri!'}</h2>
            <p style={{ color: MUTED, margin: '0 0 20px', fontSize: '0.85em' }}>{moves} moves · {formatTime(timer)}</p>

            {/* Skor simpel */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 24, background: BGM, borderRadius: 16, padding: '16px 20px', border: `2px solid ${S}` }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px', fontSize: '0.78em', fontWeight: 700, color: players[0].color }}>{players[0].name}</p>
                <p style={{ margin: 0, fontWeight: 900, fontSize: '2.8em', lineHeight: 1, color: players[0].roundWins > players[1].roundWins ? players[0].color : P }}>{players[0].roundWins}</p>
              </div>
              <div style={{ padding: '0 16px', fontSize: '1.4em', color: MUTED, fontWeight: 900 }}>:</div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px', fontSize: '0.78em', fontWeight: 700, color: players[1].color }}>{players[1].name}</p>
                <p style={{ margin: 0, fontWeight: 900, fontSize: '2.8em', lineHeight: 1, color: players[1].roundWins > players[0].roundWins ? players[1].color : P }}>{players[1].roundWins}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={doRematch}
                style={{ flex: 1, padding: '13px', borderRadius: 12, background: `linear-gradient(135deg, ${P}, #1a4d7a)`, color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '0.92em', boxShadow: '0 4px 16px rgba(3,37,76,0.25)' }}
              >
                🔄 Rematch
              </button>
              <button
                onClick={exitToSetup}
                style={{ padding: '13px 16px', borderRadius: 12, background: BGM, color: P, border: `2px solid ${S}`, fontWeight: 700, cursor: 'pointer', fontSize: '0.85em', whiteSpace: 'nowrap' }}
              >
                🚪 Keluar
              </button>
            </div>
            <p style={{ margin: '8px 0 0', color: MUTED, fontSize: '0.7em' }}>Keluar akan reset semua skor</p>
          </div>
        </div>
      )}
    </div>
  )
}