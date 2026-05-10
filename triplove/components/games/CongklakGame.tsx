'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

const P = '#03254c', S = '#c4e8ff', BG = '#d0efff', BGM = '#e1f3ff', MUTED = '#a0a0b5'

// ─── Aturan Congklak Standar Indonesia ───────────────────────────────────────
// Board: 2 pemain, masing-masing 7 lubang kecil + 1 lumbung (kalang)
// Index:  [0..6] = lubang P1 (kiri ke kanan dari sisi P1)
//         [7]    = kalang P1
//         [8..14]= lubang P2 (kiri ke kanan dari sisi P2, = kanan ke kiri papan)
//         [15]   = kalang P2
// Total 16 slot. Biji awal: 7 per lubang = 98 biji total.

const HOLES_PER_PLAYER = 7
const INITIAL_SEEDS = 7

const PLAYERS_CFG = [
  { color: P,         emoji: '💙', label: 'Player 1', kalang: 7  },
  { color: '#ec4899', emoji: '💗', label: 'Player 2', kalang: 15 },
]

function initBoard(): number[] {
  // [0-6] P1 holes, [7] P1 kalang, [8-14] P2 holes, [15] P2 kalang
  const b = Array(16).fill(INITIAL_SEEDS)
  b[7] = 0   // kalang P1
  b[15] = 0  // kalang P2
  return b
}

// Urutan giliran: P1 pilih index 0-6, P2 pilih index 8-14
// Distribusi searah jarum jam: P1 → 0,1,2,3,4,5,6,7(kalang P1),8,9,10,11,12,13,14 → skip 15(kalang P2) kalau bukan P2
// P2 → 8,9,10,11,12,13,14,15(kalang P2),0,1,2,3,4,5,6 → skip 7(kalang P1) kalau bukan P1

function getNextHole(current: number, player: number): number {
  let next = (current + 1) % 16
  // Skip kalang lawan
  if (player === 0 && next === 15) next = 0
  if (player === 1 && next === 7)  next = 8
  return next
}

function isPlayerHole(idx: number, player: number): boolean {
  return player === 0 ? idx >= 0 && idx <= 6 : idx >= 8 && idx <= 14
}

type Phase = 'setup' | 'playing' | 'finished'

export default function CongklakGame() {
  const [phase, setPhase]           = useState<Phase>('setup')
  const [names, setNames]           = useState(['', ''])
  const [board, setBoard]           = useState<number[]>(initBoard())
  const [current, setCurrent]       = useState(0)
  const [animHole, setAnimHole]     = useState<number | null>(null)
  const [moving, setMoving]         = useState(false)
  const [log, setLog]               = useState<string[]>([])
  const [winner, setWinner]         = useState<number | null>(null) // 0, 1, or 2 = draw

  const addLog = (msg: string) => setLog(prev => [msg, ...prev].slice(0, 8))

  // ── Cek kondisi selesai ─────────────────────────────────────────────────────
  function checkFinished(b: number[]): boolean {
    const p1Empty = b.slice(0, 7).every(v => v === 0)
    const p2Empty = b.slice(8, 15).every(v => v === 0)
    return p1Empty || p2Empty
  }

  function finishGame(b: number[]) {
    // Sisa biji di lubang masuk ke kalang masing-masing
    const final = [...b]
    for (let i = 0; i < 7; i++)  { final[7]  += final[i];  final[i]  = 0 }
    for (let i = 8; i < 15; i++) { final[15] += final[i]; final[i] = 0 }
    setBoard(final)

    if (final[7] > final[15])       setWinner(0)
    else if (final[15] > final[7])  setWinner(1)
    else                            setWinner(2) // seri
    setPhase('finished')
  }

  // ── Logika giliran ──────────────────────────────────────────────────────────
  const playHole = useCallback(async (holeIdx: number) => {
    if (moving || phase !== 'playing') return
    if (!isPlayerHole(holeIdx, current)) return
    if (board[holeIdx] === 0) return

    setMoving(true)
    const b = [...board]
    let seeds = b[holeIdx]
    b[holeIdx] = 0
    let pos = holeIdx
    const pname = names[current].trim() || PLAYERS_CFG[current].label
    addLog(`${PLAYERS_CFG[current].emoji} ${pname} main dari lubang ${holeIdx < 7 ? holeIdx + 1 : holeIdx - 7} (${seeds} biji)`)

    // Distribusi satu per satu dengan animasi
    while (seeds > 0) {
      pos = getNextHole(pos, current)
      setAnimHole(pos)
      b[pos]++
      seeds--
      await new Promise(r => setTimeout(r, 120))
    }

    setAnimHole(null)

    // Aturan biji terakhir
    const kalangCurrent = PLAYERS_CFG[current].kalang

    if (pos === kalangCurrent) {
      // Biji terakhir di kalang sendiri → main lagi
      setBoard([...b])
      addLog(`${PLAYERS_CFG[current].emoji} Biji terakhir di kalang! Main lagi~`)
      setMoving(false)
      return
    }

    if (isPlayerHole(pos, current) && b[pos] === 1) {
      // Biji terakhir di lubang sendiri yang kosong → ambil biji lawan di seberang
      const opposite = 14 - pos // lubang seberang
      if (b[opposite] > 0) {
        const captured = b[opposite] + 1
        b[kalangCurrent] += captured
        b[opposite] = 0
        b[pos] = 0
        addLog(`${PLAYERS_CFG[current].emoji} Tangkap ${captured} biji dari lawan! 🎉`)
      }
    }

    // Cek apakah game selesai
    if (checkFinished(b)) {
      finishGame(b)
      setMoving(false)
      return
    }

    setBoard([...b])
    setCurrent(c => c === 0 ? 1 : 0)
    setMoving(false)
  }, [moving, phase, board, current, names])

  // ── Restart ─────────────────────────────────────────────────────────────────
  function restart() {
    setBoard(initBoard())
    setCurrent(0)
    setLog([])
    setWinner(null)
    setAnimHole(null)
    setMoving(false)
    setPhase('playing')
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SETUP SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === 'setup') return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${BG}, ${BGM})`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 28, border: `2px solid ${S}`, padding: '36px 28px', maxWidth: 380, width: '100%', boxShadow: '0 16px 48px rgba(3,37,76,0.12)' }}>
        <Link href="/games" style={{ color: MUTED, fontSize: '0.85em', textDecoration: 'none', display: 'block', marginBottom: 20 }}>← Back</Link>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: '3em', marginBottom: 8 }}>🥥</div>
          <h2 style={{ fontWeight: 900, color: P, margin: '0 0 6px' }}>Congklak</h2>
          <p style={{ color: MUTED, margin: 0, fontSize: '0.88em' }}>Siapa yang biji kalangnya paling banyak?</p>
        </div>

        {/* Aturan singkat */}
        <div style={{ background: BGM, borderRadius: 14, padding: '12px 16px', marginBottom: 20, border: `1.5px solid ${S}` }}>
          <p style={{ margin: '0 0 6px', fontWeight: 800, color: P, fontSize: '0.8em' }}>📖 Aturan Singkat</p>
          <p style={{ margin: 0, color: MUTED, fontSize: '0.75em', lineHeight: 1.6 }}>
            • Pilih lubangmu, biji disebarkan searah jarum jam<br />
            • Biji terakhir di kalang → giliran lagi<br />
            • Biji terakhir di lubang kosong milikmu → tangkap biji lawan di seberang<br />
            • Game selesai saat semua lubang satu sisi kosong
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[0, 1].map(i => (
            <div key={i}>
              <label style={{ fontSize: '0.8em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 6 }}>
                {PLAYERS_CFG[i].emoji} Nama Player {i + 1}
              </label>
              <input
                value={names[i]}
                onChange={e => setNames(prev => { const n = [...prev]; n[i] = e.target.value; return n })}
                placeholder={`Player ${i + 1}`}
                style={{ width: '100%', padding: '10px 14px', border: `2px solid ${S}`, borderRadius: 12, fontSize: '0.95em', color: P, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}
          <button
            onClick={() => setPhase('playing')}
            style={{ padding: '14px', borderRadius: 14, background: `linear-gradient(135deg, ${P}, #1a4d7a)`, color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '1em', boxShadow: '0 4px 16px rgba(3,37,76,0.25)' }}>
            🥥 Mulai Main!
          </button>
        </div>
      </div>
    </div>
  )

  // ═══════════════════════════════════════════════════════════════════════════
  // PLAYING SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  const p1name = names[0].trim() || 'Player 1'
  const p2name = names[1].trim() || 'Player 2'

  // Lubang P2 ditampilkan terbalik (kanan ke kiri) supaya berhadapan dengan P1
  const p2Holes = [14, 13, 12, 11, 10, 9, 8]

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${BG}, ${BGM})`, padding: '16px 12px 80px' }}>
      <style>{`
        @keyframes pulse-seed {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .hole-btn {
          transition: all 0.18s ease;
          border: none;
          cursor: pointer;
        }
        .hole-btn:active { transform: scale(0.93); }
      `}</style>

      <div style={{ maxWidth: 500, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Link href="/games" style={{ color: P, fontWeight: 700, textDecoration: 'none', fontSize: '0.9em' }}>← Games</Link>
          <span style={{ fontWeight: 800, color: P }}>🥥 Congklak</span>
          <button onClick={restart} style={{ padding: '5px 12px', borderRadius: 999, border: `2px solid ${S}`, background: 'white', color: P, fontSize: '0.75em', fontWeight: 700, cursor: 'pointer' }}>🔄 Ulang</button>
        </div>

        {/* Scores */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[0, 1].map(i => (
            <div key={i} style={{ background: 'white', borderRadius: 16, padding: '12px 14px', border: `2px solid ${current === i ? PLAYERS_CFG[i].color : S}`, boxShadow: current === i ? `0 4px 16px ${PLAYERS_CFG[i].color}30` : 'none', transition: 'all 0.3s' }}>
              <p style={{ margin: 0, fontSize: '0.7em', color: MUTED, fontWeight: 700 }}>{current === i ? '▶ Giliran' : 'Menunggu'}</p>
              <p style={{ margin: '2px 0', fontWeight: 800, color: PLAYERS_CFG[i].color, fontSize: '0.88em' }}>{PLAYERS_CFG[i].emoji} {i === 0 ? p1name : p2name}</p>
              <p style={{ margin: 0, fontWeight: 900, color: P, fontSize: '1.4em', lineHeight: 1 }}>{board[PLAYERS_CFG[i].kalang]} biji</p>
            </div>
          ))}
        </div>

        {/* PAPAN CONGKLAK */}
        <div style={{ background: '#7c4a1e', borderRadius: 28, padding: '14px 10px', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', marginBottom: 14, border: '3px solid #5a3210' }}>

          {/* Label P2 */}
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <span style={{ color: '#fcd9a0', fontSize: '0.78em', fontWeight: 800, opacity: 0.9 }}>
              {PLAYERS_CFG[1].emoji} {p2name} {current === 1 ? '← pilih lubangmu' : ''}
            </span>
          </div>

          {/* Baris utama papan */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>

            {/* Kalang P2 (kiri) */}
            <Kalang value={board[15]} color='#ec4899' label={p2name} />

            {/* 7 lubang tengah */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>

              {/* Baris P2 (atas, terbalik) */}
              <div style={{ display: 'flex', gap: 4, justifyContent: 'space-between' }}>
                {p2Holes.map(idx => (
                  <HoleButton
                    key={idx}
                    value={board[idx]}
                    isActive={current === 1 && !moving}
                    isAnim={animHole === idx}
                    playerColor='#ec4899'
                    onClick={() => playHole(idx)}
                    label={idx - 7}
                  />
                ))}
              </div>

              {/* Divider kayu */}
              <div style={{ height: 6, borderRadius: 999, background: '#5a3210', margin: '2px 0' }} />

              {/* Baris P1 (bawah) */}
              <div style={{ display: 'flex', gap: 4, justifyContent: 'space-between' }}>
                {[0, 1, 2, 3, 4, 5, 6].map(idx => (
                  <HoleButton
                    key={idx}
                    value={board[idx]}
                    isActive={current === 0 && !moving}
                    isAnim={animHole === idx}
                    playerColor={P}
                    onClick={() => playHole(idx)}
                    label={idx + 1}
                  />
                ))}
              </div>
            </div>

            {/* Kalang P1 (kanan) */}
            <Kalang value={board[7]} color={P} label={p1name} />
          </div>

          {/* Label P1 */}
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <span style={{ color: '#fcd9a0', fontSize: '0.78em', fontWeight: 800, opacity: 0.9 }}>
              {PLAYERS_CFG[0].emoji} {p1name} {current === 0 ? '→ pilih lubangmu' : ''}
            </span>
          </div>
        </div>

        {/* Status giliran */}
        <div style={{ background: 'white', borderRadius: 14, border: `2px solid ${S}`, padding: '10px 16px', marginBottom: 12, textAlign: 'center' }}>
          {moving
            ? <p style={{ margin: 0, fontWeight: 700, color: MUTED, fontSize: '0.85em' }}>⏳ Menyebarkan biji...</p>
            : <p style={{ margin: 0, fontWeight: 700, color: P, fontSize: '0.85em' }}>
                {PLAYERS_CFG[current].emoji} Giliran <span style={{ color: current === 0 ? P : '#ec4899' }}>{current === 0 ? p1name : p2name}</span> — tap lubang untuk main
              </p>
          }
        </div>

        {/* Log */}
        {log.length > 0 && (
          <div style={{ background: 'white', borderRadius: 16, border: `2px solid ${S}`, padding: '12px 16px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '0.78em', fontWeight: 700, color: MUTED }}>📜 Riwayat</p>
            {log.map((l, i) => (
              <p key={i} style={{ margin: 0, fontSize: '0.8em', color: i === 0 ? P : MUTED, fontWeight: i === 0 ? 700 : 400, padding: '3px 0', borderBottom: i < log.length - 1 ? `1px solid ${BGM}` : 'none' }}>{l}</p>
            ))}
          </div>
        )}
      </div>

      {/* Winner modal */}
      {phase === 'finished' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(3,37,76,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 28, padding: '36px 28px', maxWidth: 340, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(3,37,76,0.25)' }}>
            <div style={{ fontSize: '3.5em', marginBottom: 12 }}>{winner === 2 ? '🤝' : '🏆'}</div>
            {winner === 2
              ? <><h2 style={{ fontWeight: 900, color: P, margin: '0 0 8px' }}>Seri! 🤝</h2><p style={{ color: MUTED, margin: '0 0 20px' }}>Kalian sama kuat!</p></>
              : <><h2 style={{ fontWeight: 900, color: P, margin: '0 0 8px' }}>{winner === 0 ? p1name : p2name} Menang!</h2><p style={{ color: MUTED, margin: '0 0 4px' }}>Biji di kalang:</p></>
            }
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', margin: '8px 0 24px' }}>
              {[0, 1].map(i => (
                <div key={i} style={{ textAlign: 'center', padding: '10px 18px', borderRadius: 14, background: winner === i ? BGM : 'white', border: `2px solid ${winner === i ? PLAYERS_CFG[i].color : S}` }}>
                  <p style={{ margin: 0, fontSize: '0.78em', color: MUTED }}>{i === 0 ? p1name : p2name}</p>
                  <p style={{ margin: 0, fontWeight: 900, fontSize: '1.8em', color: PLAYERS_CFG[i].color }}>{board[PLAYERS_CFG[i].kalang]}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={restart} style={{ flex: 1, padding: '12px', borderRadius: 12, background: P, color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}>🔄 Main Lagi</button>
              <Link href="/games" style={{ flex: 1, padding: '12px', borderRadius: 12, background: BGM, color: P, border: `2px solid ${S}`, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎮 Games</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HoleButton({ value, isActive, isAnim, playerColor, onClick, label }: {
  value: number
  isActive: boolean
  isAnim: boolean
  playerColor: string
  onClick: () => void
  label: number
}) {
  const isEmpty = value === 0
  return (
    <button
      className="hole-btn"
      onClick={onClick}
      disabled={!isActive || isEmpty}
      style={{
        width: 42, height: 42, borderRadius: '50%',
        background: isAnim ? '#fef08a' : isEmpty ? '#3d1f0a' : '#6b3a1f',
        border: `2px solid ${isActive && !isEmpty ? playerColor : '#4a2810'}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        boxShadow: isAnim ? '0 0 12px #fef08a' : isActive && !isEmpty ? `0 2px 8px ${playerColor}60` : 'inset 0 2px 4px rgba(0,0,0,0.3)',
        animation: isAnim ? 'pulse-seed 0.3s ease infinite' : 'none',
        opacity: isEmpty ? 0.5 : 1,
        cursor: isActive && !isEmpty ? 'pointer' : 'default',
      }}
    >
      <span style={{ fontSize: '0.7em', fontWeight: 900, color: isEmpty ? '#6b3a1f' : '#fcd9a0', lineHeight: 1 }}>{value}</span>
    </button>
  )
}

function Kalang({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div style={{
      width: 52, minHeight: 110, borderRadius: 26,
      background: '#6b3a1f', border: `2px solid ${color}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 4, boxShadow: `0 2px 12px ${color}40`, flexShrink: 0,
    }}>
      <span style={{ fontSize: '0.6em', color: '#fcd9a0', fontWeight: 700, textAlign: 'center', lineHeight: 1.2, maxWidth: 44, wordBreak: 'break-word' }}>Kalang</span>
      <span style={{ fontSize: '1.2em', fontWeight: 900, color: '#fcd9a0' }}>{value}</span>
    </div>
  )
}