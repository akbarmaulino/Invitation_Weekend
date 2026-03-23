'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// ─── Constants & Types ────────────────────────────────────────────────────────
type Color = 'red' | 'yellow' | 'green' | 'blue' | 'wild'
type CardType = 'number' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4'
interface UnoCard { id: number; color: Color; type: CardType; value: string }
type Phase = 'setup' | 'waiting' | 'playing' | 'finished'

const COLOR_HEX: Record<Color, string> = {
  red: '#E8192C', yellow: '#FFD900', green: '#009C48', blue: '#0056A6', wild: '#1a1a2e'
}
const COLOR_DARK: Record<Color, string> = {
  red: '#9B0018', yellow: '#B89800', green: '#006630', blue: '#003070', wild: '#000'
}
const COLOR_LIGHT: Record<Color, string> = {
  red: '#FF6B7A', yellow: '#FFE866', green: '#4DC878', blue: '#4D96E0', wild: '#888'
}

// ─── Card ID generator ────────────────────────────────────────────────────────
let cardId = 0
function makeCard(color: Color, type: CardType, value: string): UnoCard {
  return { id: cardId++, color, type, value }
}

function makeDeck(): UnoCard[] {
  const colors: Color[] = ['red', 'yellow', 'green', 'blue']
  const deck: UnoCard[] = []
  colors.forEach(c => {
    deck.push(makeCard(c, 'number', '0'))
    for (let n = 1; n <= 9; n++) {
      deck.push(makeCard(c, 'number', String(n)))
      deck.push(makeCard(c, 'number', String(n)))
    }
    deck.push(makeCard(c, 'skip', 'skip')); deck.push(makeCard(c, 'skip', 'skip'))
    deck.push(makeCard(c, 'reverse', 'reverse')); deck.push(makeCard(c, 'reverse', 'reverse'))
    deck.push(makeCard(c, 'draw2', 'draw2')); deck.push(makeCard(c, 'draw2', 'draw2'))
  })
  for (let i = 0; i < 4; i++) {
    deck.push(makeCard('wild', 'wild', 'wild'))
    deck.push(makeCard('wild', 'wild4', 'wild4'))
  }
  return deck.sort(() => Math.random() - 0.5)
}

function canPlay(card: UnoCard, top: UnoCard, currentColor: Color): boolean {
  if (card.type === 'wild' || card.type === 'wild4') return true
  if (card.color === currentColor) return true
  if (card.type === 'number' && top.type === 'number') return card.value === top.value
  if (card.type !== 'number' && card.type === top.type) return true
  return false
}

function canCounter(card: UnoCard): boolean {
  return card.type === 'draw2' || card.type === 'wild4'
}

// ─── UNO Card SVG Component ───────────────────────────────────────────────────
function UnoCardSVG({ card, size = 'md', selected, onClick, disabled, faceDown }: {
  card: UnoCard; size?: 'sm' | 'md' | 'lg'
  selected?: boolean; onClick?: () => void; disabled?: boolean; faceDown?: boolean
}) {
  const w = size === 'sm' ? 44 : size === 'md' ? 64 : 88
  const h = Math.round(w * 1.45)
  const bg = faceDown ? '#1a1a2e' : COLOR_HEX[card.color]
  const dark = faceDown ? '#000' : COLOR_DARK[card.color]
  const light = faceDown ? '#333' : COLOR_LIGHT[card.color]
  const r = Math.round(w * 0.12)

  const getSymbol = () => {
    if (faceDown) return { top: '🂠', center: '', bottom: '' }
    switch (card.type) {
      case 'skip': return { top: '⊘', center: '⊘', bottom: '⊘' }
      case 'reverse': return { top: '⇄', center: '⇄', bottom: '⇄' }
      case 'draw2': return { top: '+2', center: '+2', bottom: '+2' }
      case 'wild': return { top: '🌈', center: '', bottom: '🌈' }
      case 'wild4': return { top: '+4', center: '', bottom: '+4' }
      default: return { top: card.value, center: card.value, bottom: card.value }
    }
  }
  const sym = getSymbol()
  const fs = size === 'sm' ? 10 : size === 'md' ? 14 : 20
  const fsCenter = size === 'sm' ? 16 : size === 'md' ? 26 : 38

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      title={disabled ? 'Tidak bisa dimainkan' : ''}
      style={{
        width: w, height: h, borderRadius: r, cursor: disabled ? 'not-allowed' : onClick ? 'pointer' : 'default',
        transform: selected ? 'translateY(-14px) scale(1.05)' : 'translateY(0) scale(1)',
        transition: 'transform 0.18s cubic-bezier(.34,1.56,.64,1), box-shadow 0.18s',
        boxShadow: selected
          ? `0 12px 32px rgba(0,0,0,0.45), 0 0 0 3px white, 0 0 0 5px ${bg}`
          : disabled ? '0 2px 4px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.3)',
        flexShrink: 0, userSelect: 'none', position: 'relative',
        opacity: disabled ? 0.4 : 1,
        filter: disabled ? 'grayscale(30%)' : 'none',
      }}
    >
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
        <rect width={w} height={h} rx={r} fill={bg} />
        <rect x={2} y={2} width={w-4} height={h-4} rx={r-1} fill="none" stroke="white" strokeWidth={2} />
        {faceDown ? (
          <>
            <ellipse cx={w/2} cy={h/2} rx={w*0.38} ry={h*0.3} fill="#E8192C" transform={`rotate(-30,${w/2},${h/2})`} />
            <text x={w/2} y={h/2 + fs*0.38} textAnchor="middle" fill="white" fontWeight="900" fontSize={fs*1.5} fontFamily="'Arial Black', sans-serif" transform={`rotate(-30,${w/2},${h/2})`}>UNO</text>
          </>
        ) : (
          <>
            {card.type !== 'wild' && card.type !== 'wild4' && (
              <ellipse cx={w/2} cy={h/2} rx={w*0.35} ry={h*0.28} fill={light} transform={`rotate(-30,${w/2},${h/2})`} />
            )}
            {(card.type === 'wild' || card.type === 'wild4') && (
              <>
                <path d={`M${w/2},${h/2} L${w/2},${h*0.18} A${w*0.35},${h*0.35} 0 0,1 ${w*0.82},${h/2} Z`} fill="#E8192C" />
                <path d={`M${w/2},${h/2} L${w*0.82},${h/2} A${w*0.35},${h*0.35} 0 0,1 ${w/2},${h*0.82} Z`} fill="#FFD900" />
                <path d={`M${w/2},${h/2} L${w/2},${h*0.82} A${w*0.35},${h*0.35} 0 0,1 ${w*0.18},${h/2} Z`} fill="#009C48" />
                <path d={`M${w/2},${h/2} L${w*0.18},${h/2} A${w*0.35},${h*0.35} 0 0,1 ${w/2},${h*0.18} Z`} fill="#0056A6" />
                <circle cx={w/2} cy={h/2} r={w*0.12} fill="black" />
              </>
            )}
            <text x={w*0.12} y={h*0.16} fill="white" fontWeight="900" fontSize={fs} fontFamily="'Arial Black', sans-serif" textAnchor="start">{sym.top}</text>
            {sym.center && (
              <text x={w/2} y={h/2 + fsCenter*0.38} fill={dark} fontWeight="900" fontSize={fsCenter} fontFamily="'Arial Black', sans-serif" textAnchor="middle">{sym.center}</text>
            )}
            {card.type === 'wild4' && (
              <text x={w/2} y={h/2 + fsCenter*0.38} fill="white" fontWeight="900" fontSize={fsCenter*0.75} fontFamily="'Arial Black', sans-serif" textAnchor="middle">+4</text>
            )}
            <text x={w*0.88} y={h*0.88} fill="white" fontWeight="900" fontSize={fs} fontFamily="'Arial Black', sans-serif" textAnchor="end" transform={`rotate(180,${w*0.88},${h*0.88})`}>{sym.bottom}</text>
          </>
        )}
      </svg>
    </div>
  )
}

// ─── Rules Panel ──────────────────────────────────────────────────────────────
function RulesPanel({ onClose }: { onClose: () => void }) {
  const rules = [
    { icon: '🎯', title: 'Tujuan', desc: 'Habiskan semua kartu duluan. Pertama habis = menang!' },
    { icon: '🃏', title: 'Giliran', desc: 'Mainkan 1 kartu yang cocok warna atau angkanya dengan kartu teratas.' },
    { icon: '🔢', title: 'Multi Kartu', desc: 'Punya kartu dengan nilai/tipe sama? Bisa mainkan sekaligus!' },
    { icon: '⊘', title: 'Skip', desc: 'Giliran lawan dilewati.' },
    { icon: '⇄', title: 'Reverse', desc: 'Di 2 pemain, berlaku seperti Skip.' },
    { icon: '+2', title: 'Draw 2', desc: 'Lawan ambil 2 kartu & gilirannya dilewati.' },
    { icon: '🌈', title: 'Wild', desc: 'Mainkan kapan saja. Pilih warna berikutnya.' },
    { icon: '+4', title: 'Wild Draw 4', desc: 'Lawan ambil 4 kartu & kamu pilih warna. Hanya valid jika tidak punya kartu warna yang cocok.' },
    { icon: '🚨', title: 'UNO!', desc: 'Saat kartu tinggal 1, banner UNO muncul — klik dalam 5 detik! Kalau telat, kena +2 kartu otomatis.' },
    { icon: '⚡', title: 'Challenge', desc: 'Kalau lawan lupa teriak UNO, tekan Lupa UNO! sebelum giliran berikutnya.' },
    { icon: '🃏', title: 'Draw', desc: 'Tidak bisa main? Ambil 1 kartu. Kalau bisa dimainkan, boleh langsung main.' },
  ]
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
      pointerEvents: 'none',
    }}>
      <div style={{
        pointerEvents: 'all', background: '#0f1729', borderLeft: '1px solid rgba(255,255,255,0.1)',
        width: 300, height: '100vh', overflowY: 'auto', padding: '20px 16px',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.5)', animation: 'slideIn 0.25s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: 'white', fontWeight: 900, fontSize: '1.1em', fontFamily: '"Arial Black", sans-serif' }}>📖 ATURAN UNO</h3>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: 8, cursor: 'pointer', fontSize: 16, width: 32, height: 32 }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rules.map((r, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '10px 12px', borderLeft: '3px solid #E8192C' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 16 }}>{r.icon}</span>
                <span style={{ color: 'white', fontWeight: 800, fontSize: '0.85em' }}>{r.title}</span>
              </div>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.78em', lineHeight: 1.5 }}>{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>
    </div>
  )
}

// ─── UNO Prompt Banner ────────────────────────────────────────────────────────
// Muncul di layar pemain yang kartunya tinggal 1 setelah main.
// Countdown 5 detik — kalau tidak klik, otomatis kena +2.
function UnoBanner({
  countdown,
  onCall,
}: {
  countdown: number
  onCall: () => void
}) {
  // Warna lingkaran countdown berubah sesuai sisa waktu
  const urgencyColor = countdown <= 2 ? '#E8192C' : countdown <= 3 ? '#FFD900' : '#009C48'
  const circumference = 2 * Math.PI * 28 // radius 28
  const dashOffset = circumference * (1 - countdown / 5)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 80,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      // backdrop semi-transparan supaya game tetap kelihatan
      background: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(3px)',
      animation: 'unoBackdropIn 0.2s ease',
    }}>
      <style>{`
        @keyframes unoBackdropIn {
          from { opacity: 0 }
          to   { opacity: 1 }
        }
        @keyframes unoBannerIn {
          0%   { transform: scale(0.6) rotate(-8deg); opacity: 0 }
          60%  { transform: scale(1.08) rotate(2deg); opacity: 1 }
          100% { transform: scale(1) rotate(0deg); opacity: 1 }
        }
        @keyframes unoPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(232,25,44,0.5), 0 24px 64px rgba(0,0,0,0.6) }
          50%     { box-shadow: 0 0 0 18px rgba(232,25,44,0), 0 24px 64px rgba(0,0,0,0.6) }
        }
        @keyframes unoTextBounce {
          0%,100% { transform: scale(1) }
          50%     { transform: scale(1.04) }
        }
      `}</style>

      <div style={{
        background: 'linear-gradient(160deg, #1a0a0e 0%, #2d0a10 50%, #1a0a0e 100%)',
        border: '2px solid rgba(232,25,44,0.5)',
        borderRadius: 28,
        padding: '36px 40px',
        textAlign: 'center',
        maxWidth: 340,
        width: '88%',
        animation: 'unoBannerIn 0.35s cubic-bezier(.34,1.56,.64,1) both, unoPulse 1.2s ease-in-out infinite',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Dekorasi background */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 28,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(232,25,44,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Label kecil */}
        <p style={{
          margin: '0 0 6px', fontSize: '0.7em', fontWeight: 800,
          color: 'rgba(255,255,255,0.4)', letterSpacing: 3, textTransform: 'uppercase',
          fontFamily: 'inherit',
        }}>Kartu kamu tinggal 1!</p>

        {/* Teks UNO besar */}
        <div style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, #E8192C, #FF6B7A)',
          borderRadius: 16, padding: '10px 36px', marginBottom: 20,
          boxShadow: '0 4px 24px rgba(232,25,44,0.5)',
          animation: 'unoTextBounce 0.6s ease-in-out infinite',
        }}>
          <span style={{
            color: 'white', fontWeight: 900, fontSize: '3em',
            fontFamily: '"Arial Black", sans-serif',
            letterSpacing: 6, textShadow: '3px 3px 0 #9B0018',
          }}>UNO</span>
        </div>

        {/* Countdown ring */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
          {/* Ring + angka dalam satu wrapper position:relative */}
          <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
            <svg width={72} height={72} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
              {/* Track */}
              <circle cx={36} cy={36} r={28} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5} />
              {/* Progress */}
              <circle
                cx={36} cy={36} r={28} fill="none"
                stroke={urgencyColor}
                strokeWidth={5}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s ease' }}
              />
            </svg>
            {/* Angka tepat di tengah ring */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                fontSize: '1.5em', fontWeight: 900, color: urgencyColor,
                fontFamily: '"Arial Black", sans-serif',
                transition: 'color 0.3s',
                textShadow: `0 0 12px ${urgencyColor}88`,
                lineHeight: 1,
              }}>{countdown}</span>
            </div>
          </div>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.82em', fontWeight: 700, lineHeight: 1.4 }}>
            detik lagi<br />
            <span style={{ color: countdown <= 2 ? '#FF6B7A' : 'rgba(255,255,255,0.3)', fontSize: '0.85em', transition: 'color 0.3s' }}>
              {countdown <= 2 ? '⚠️ Hampir habis!' : 'Klik sebelum waktu habis'}
            </span>
          </p>
        </div>

        {/* Tombol UNO */}
        <button
          onClick={onCall}
          style={{
            width: '100%', padding: '18px', borderRadius: 16,
            background: 'linear-gradient(135deg, #E8192C 0%, #FF4458 50%, #E8192C 100%)',
            backgroundSize: '200% 200%',
            color: 'white', border: 'none',
            fontWeight: 900, cursor: 'pointer',
            fontSize: '1.3em', fontFamily: '"Arial Black", sans-serif',
            letterSpacing: 4, textShadow: '2px 2px 0 #9B0018',
            boxShadow: '0 8px 32px rgba(232,25,44,0.6), inset 0 1px 0 rgba(255,255,255,0.2)',
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 40px rgba(232,25,44,0.8), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(232,25,44,0.6), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}
          onMouseDown={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'}
          onMouseUp={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)'}
        >
          🚨 UNO!
        </button>

        {/* Peringatan */}
        <p style={{ margin: '12px 0 0', color: 'rgba(255,255,255,0.3)', fontSize: '0.72em', fontWeight: 700 }}>
          Telat klik = +2 kartu otomatis 😱
        </p>
      </div>
    </div>
  )
}

// ─── Game State ───────────────────────────────────────────────────────────────
interface GameState {
  deck: UnoCard[]
  hands: UnoCard[][]
  discard: UnoCard[]
  currentColor: Color
  currentPlayer: number
  direction: number
  winner: number | null
  unoCalledBy: number | null
  startCards: number
  pendingDraw: number
  unoWindowOpen: boolean
  scores: [number, number]  // [player0score, player1score]
  rematchRequestedBy: number | null  // siapa yang request rematch
}

function buildInitialState(startCards: number): GameState {
  cardId = 0
  const d = makeDeck()
  const h0 = d.splice(0, startCards)
  const h1 = d.splice(0, startCards)
  const topIdx = d.findIndex(c => c.type === 'number')
  const top = d.splice(topIdx, 1)[0]
  return { deck: d, hands: [h0, h1], discard: [top], currentColor: top.color, currentPlayer: 0, direction: 1, winner: null, unoCalledBy: null, startCards, pendingDraw: 0, unoWindowOpen: false, scores: [0, 0], rematchRequestedBy: null }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UnoGame() {
  const [phase, setPhase]               = useState<Phase>('setup')
  const [myIndex, setMyIndex]           = useState<0 | 1>(0)
  const [myName, setMyName]             = useState('')
  const [gameId, setGameId]             = useState<string | null>(null)
  const [inviteCode, setInviteCode]     = useState<string | null>(null)
  const [inviteInput, setInviteInput]   = useState('')
  const [gameState, setGameState]       = useState<GameState | null>(null)
  const [selectedCards, setSelectedCards] = useState<number[]>([])
  const [wildPicker, setWildPicker]     = useState(false)
  const [pendingCardIdxs, setPendingCardIdxs] = useState<number[]>([])
  const [msg, setMsg]                   = useState('')
  const [unoAlert, setUnoAlert]         = useState<string | null>(null)
  const [opponentName, setOpponentName] = useState<string | null>(null)
  const [copied, setCopied]             = useState(false)
  const [joining, setJoining]           = useState(false)
  const [creating, setCreating]         = useState(false)
  const [showRules, setShowRules]       = useState(false)
  const [startCards, setStartCards]     = useState(7)
  const [unoChallenged, setUnoChallenged] = useState(false)
  const [lastPlayedAnim, setLastPlayedAnim] = useState(false)
  const [scores, setScores]               = useState<[number, number]>([0, 0])
  const [rematchReady, setRematchReady]   = useState(false)  // lawan sudah request rematch

  // ─── UNO prompt state ──────────────────────────────────────────────────────
  // showUnoBanner: apakah banner tampil (hanya untuk pemain ini, bukan lawannya)
  const [showUnoBanner, setShowUnoBanner] = useState(false)
  const [unoCountdown, setUnoCountdown]   = useState(5)
  // Simpan snapshot state saat banner muncul, untuk diterapkan setelah pemain klik/timeout
  const pendingUnoStateRef  = useRef<GameState | null>(null)
  const unoTimerRef         = useRef<ReturnType<typeof setInterval> | null>(null)
  const unoTimeoutRef       = useRef<ReturnType<typeof setTimeout> | null>(null)

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('join')
    if (code) setInviteInput(code.toUpperCase())
  }, [])

  useEffect(() => {
    if (!gameId) return
    const channel = supabase
      .channel(`uno_game_${gameId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'uno_games', filter: `id=eq.${gameId}` }, payload => {
        const row = payload.new as any
        const newGs = row.state as GameState
        // Selalu sync state & nama — tidak ada kondisi phase di sini
        if (row.state) setGameState(newGs)
        if (row.player2_name) setOpponentName(myIndex === 0 ? row.player2_name : row.player1_name)
      })
      .subscribe()
    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [gameId, myIndex])  // ← hapus phase dari deps, channel tidak perlu re-subscribe

  // waiting → playing saat lawan join (opponentName di-set dari listener)
  useEffect(() => {
    if (opponentName) {
      setPhase(prev => prev === 'waiting' ? 'playing' : prev)
    }
  }, [opponentName])

  // Track apakah game sebelumnya pernah punya winner (untuk deteksi rematch)
  const hadWinnerRef = useRef(false)

  useEffect(() => {
    if (!gameState) return

    // Sync skor
    if (gameState.scores) setScores(gameState.scores)

    // Tandai kalau sudah pernah ada winner di session ini
    if (gameState.winner !== null) {
      hadWinnerRef.current = true
    }

    // Lawan push rematch — winner jadi null padahal sebelumnya ada winner = game baru
    if (hadWinnerRef.current && gameState.winner === null) {
      hadWinnerRef.current = false
      setPhase('playing')
      setSelectedCards([])
      setMsg('')
      setRematchReady(false)
    }
  }, [gameState])

  useEffect(() => {
    if (!gameState) return
    if (gameState.unoCalledBy !== null) {
      const names = myIndex === 0 ? [myName || 'Player 1', opponentName || 'Player 2'] : [opponentName || 'Player 1', myName || 'Player 2']
      setUnoAlert(`🚨 ${names[gameState.unoCalledBy]} UNO!`)
      setTimeout(() => setUnoAlert(null), 2500)
    }
  }, [gameState?.unoCalledBy])

  // ─── Cleanup timer saat unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (unoTimerRef.current) clearInterval(unoTimerRef.current)
      if (unoTimeoutRef.current) clearTimeout(unoTimeoutRef.current)
    }
  }, [])

  // ─── Fungsi: mulai countdown UNO ──────────────────────────────────────────
  // Dipanggil setelah applyPlay mendeteksi kartu pemain tinggal 1.
  // `stateToCommit` adalah state game yang belum di-push ke Supabase —
  // push-nya ditunda sampai pemain klik UNO atau waktu habis.
  function startUnoCountdown(stateToCommit: GameState) {
    // Bersihkan timer lama kalau ada
    if (unoTimerRef.current) clearInterval(unoTimerRef.current)
    if (unoTimeoutRef.current) clearTimeout(unoTimeoutRef.current)

    // Tandai ke lawan bahwa countdown sedang berjalan — blokir tombol challenge
    stateToCommit.unoWindowOpen = true
    pendingUnoStateRef.current = stateToCommit
    setUnoCountdown(5)
    setShowUnoBanner(true)
    // Push state dengan unoWindowOpen=true supaya lawan tahu countdown aktif
    pushState(stateToCommit)

    // Tick setiap detik untuk update angka countdown
    let remaining = 5
    unoTimerRef.current = setInterval(() => {
      remaining -= 1
      setUnoCountdown(remaining)
      if (remaining <= 0) {
        clearInterval(unoTimerRef.current!)
      }
    }, 1000)

    // Setelah 5 detik — kena penalti
    unoTimeoutRef.current = setTimeout(() => {
      handleUnoPenalty()
    }, 5000)
  }

  // ─── Klik UNO sebelum timeout ─────────────────────────────────────────────
  function handleUnoCall() {
    if (unoTimerRef.current) clearInterval(unoTimerRef.current)
    if (unoTimeoutRef.current) clearTimeout(unoTimeoutRef.current)
    setShowUnoBanner(false)

    const gs = pendingUnoStateRef.current
    if (!gs) return
    // Tandai bahwa pemain ini sudah call UNO, tutup window
    gs.unoCalledBy = myIndex
    gs.unoWindowOpen = false
    pendingUnoStateRef.current = null
    pushState(gs)
  }

  // ─── Timeout — pemain lupa klik UNO ──────────────────────────────────────
  function handleUnoPenalty() {
    if (unoTimerRef.current) clearInterval(unoTimerRef.current)
    setShowUnoBanner(false)

    const gs = pendingUnoStateRef.current
    if (!gs) return

    // Berikan +2 ke pemain yang lupa, lalu push state
    const gsWithPenalty: GameState = JSON.parse(JSON.stringify(gs))
    for (let i = 0; i < 2; i++) {
      if (!gsWithPenalty.deck.length) refillDeck(gsWithPenalty)
      gsWithPenalty.hands[myIndex].push(gsWithPenalty.deck.pop()!)
    }
    gsWithPenalty.unoCalledBy = null
    gsWithPenalty.unoWindowOpen = false
    pendingUnoStateRef.current = null

    setMsg('😱 Lupa bilang UNO! Kena +2 kartu otomatis')
    pushState(gsWithPenalty)
  }

  // ─── Supabase push ────────────────────────────────────────────────────────
  async function pushState(newState: GameState) {
    if (!gameId) return
    setGameState(newState)
    await supabase.from('uno_games').update({
      state: newState,
      status: newState.winner !== null ? 'finished' : 'playing',
      updated_at: new Date().toISOString(),
    }).eq('id', gameId)
  }

  async function createGame() {
    setCreating(true)
    const initState = buildInitialState(startCards)
    const name = myName.trim() || 'Player 1'
    const code = Math.random().toString(36).slice(2, 10).toUpperCase()
    const { data, error } = await supabase
      .from('uno_games')
      .insert({ player1_name: name, state: initState, status: 'waiting', invite_code: code })
      .select().single()
    if (error || !data) { setMsg('Gagal membuat game 😢'); setCreating(false); return }
    setGameId(data.id); setInviteCode(data.invite_code); setMyIndex(0)
    setGameState(initState); setPhase('waiting'); setCreating(false)
  }

  async function joinGame() {
    const code = inviteInput.trim().toUpperCase()
    if (!code) return
    setJoining(true)
    const { data, error } = await supabase.from('uno_games').select('*').eq('invite_code', code).single()
    if (error || !data) { setMsg('Kode tidak ditemukan 😢'); setJoining(false); return }
    if (data.status !== 'waiting') { setMsg('Game sudah penuh atau selesai'); setJoining(false); return }
    const name = myName.trim() || 'Player 2'
    const { error: e2 } = await supabase.from('uno_games').update({ player2_name: name, status: 'playing' }).eq('id', data.id)
    if (e2) { setMsg('Gagal join game 😢'); setJoining(false); return }
    setGameId(data.id); setMyIndex(1); setGameState(data.state as GameState)
    setOpponentName(data.player1_name); setPhase('playing'); setJoining(false)
  }

  function getNextPlayer(cur: number, dir: number) { return (cur + dir + 2) % 2 }

  function refillDeck(gs: GameState): UnoCard[] {
    const newDeck = gs.discard.slice(0, -1).sort(() => Math.random() - 0.5)
    gs.discard = [gs.discard[gs.discard.length - 1]]
    gs.deck = newDeck
    return newDeck
  }

  function toggleSelect(idx: number) {
    if (!gameState) return
    if (gameState.currentPlayer !== myIndex) { setMsg('Bukan giliran kamu!'); return }
    const myHand = gameState.hands[myIndex]
    const top = gameState.discard[gameState.discard.length - 1]
    const card = myHand[idx]
    setSelectedCards(prev => {
      if (prev.includes(idx)) return prev.filter(i => i !== idx)
      if (prev.length === 0) {
        if (gameState.pendingDraw > 0) {
          if (!canCounter(card)) { setMsg(`⚠️ Kena draw ${gameState.pendingDraw}! Hanya +2 atau +4 yang bisa nangkis. Atau tap deck untuk ambil.`); return prev }
        } else {
          if (!canPlay(card, top, gameState.currentColor)) { setMsg('❌ Kartu ini tidak bisa dimainkan!'); return prev }
        }
        return [idx]
      }
      const firstCard = myHand[prev[0]]
      if (card.value !== firstCard.value) { setMsg('Multi kartu harus punya nilai yang sama!'); return prev }
      return [...prev, idx]
    })
    setMsg('')
  }

  function playSelectedCards() {
    if (!gameState || selectedCards.length === 0) return
    const myHand = gameState.hands[myIndex]
    const top = gameState.discard[gameState.discard.length - 1]
    const orderedIdxs = [...selectedCards]
    const orderedCards = orderedIdxs.map(i => myHand[i])
    const firstOk = gameState.pendingDraw > 0
      ? canCounter(orderedCards[0])
      : canPlay(orderedCards[0], top, gameState.currentColor)
    if (!firstOk) {
      setMsg(gameState.pendingDraw > 0 ? `Hanya +2 atau +4 yang bisa nangkis draw ${gameState.pendingDraw}!` : 'Kartu pertama tidak cocok dengan kartu atas!')
      return
    }
    const lastCard = orderedCards[orderedCards.length - 1]
    if (lastCard.type === 'wild' || lastCard.type === 'wild4') {
      setPendingCardIdxs(orderedIdxs)
      setWildPicker(true)
      return
    }
    applyPlay(orderedIdxs, orderedCards, lastCard.color)
    setSelectedCards([])
  }

  function applyPlay(cardIdxs: number[], cards: UnoCard[], newColor: Color) {
    if (!gameState) return
    const gs: GameState = JSON.parse(JSON.stringify(gameState))

    const sortedIdxs = [...cardIdxs].sort((a, b) => b - a)
    sortedIdxs.forEach(i => gs.hands[myIndex].splice(i, 1))
    const lastCard = cards[cards.length - 1]
    gs.discard.push({ ...lastCard, color: newColor })

    // Cek menang
    if (gs.hands[myIndex].length === 0) {
      gs.winner = myIndex
      // Akumulasi skor dari state sebelumnya
      const prevScores = gameState?.scores ?? [0, 0]
      gs.scores = [...prevScores] as [number, number]
      gs.scores[myIndex] += 1
      hadWinnerRef.current = true  // tandai supaya rematch detection aktif
      pushState(gs)
      setPhase('finished')
      return
    }

    // ─── Cek UNO — kartu tinggal 1 ──────────────────────────────────────────
    // Jangan push state dulu; tunda sampai pemain klik UNO atau timeout
    const justHitUno = gs.hands[myIndex].length === 1
    // Reset flag dulu (akan diisi di handleUnoCall jika klik, atau dibiarkan null jika penalty)
    gs.unoCalledBy = null

    let nextP = getNextPlayer(myIndex, gs.direction)

    cards.forEach(card => { if (card.type === 'reverse') gs.direction *= -1 })
    const reverseCount = cards.filter(c => c.type === 'reverse').length
    const skipCount = cards.filter(c => c.type === 'skip').length
    const draw2Count = cards.filter(c => c.type === 'draw2').length
    const wild4Count = cards.filter(c => c.type === 'wild4').length
    const totalDrawAdded = draw2Count * 2 + wild4Count * 4

    nextP = getNextPlayer(myIndex, gs.direction)

    if (skipCount + (reverseCount % 2 === 1 ? 1 : 0) > 0) {
      nextP = getNextPlayer(nextP, gs.direction)
    }

    if (totalDrawAdded > 0) {
      gs.pendingDraw = (gs.pendingDraw || 0) + totalDrawAdded
      nextP = getNextPlayer(myIndex, gs.direction)
    }

    gs.currentColor = newColor
    gs.currentPlayer = nextP

    setLastPlayedAnim(true)
    setTimeout(() => setLastPlayedAnim(false), 400)
    setSelectedCards([])

    if (justHitUno) {
      // Tunda push — tunggu pemain klik UNO atau timeout
      startUnoCountdown(gs)
    } else {
      pushState(gs)
    }
  }

  function drawCard() {
    if (!gameState) return
    if (gameState.currentPlayer !== myIndex) { setMsg('Bukan giliran kamu!'); return }
    const gs: GameState = JSON.parse(JSON.stringify(gameState))

    if (gs.pendingDraw > 0) {
      const count = gs.pendingDraw
      for (let i = 0; i < count; i++) {
        if (!gs.deck.length) refillDeck(gs)
        gs.hands[myIndex].push(gs.deck.pop()!)
      }
      gs.pendingDraw = 0
      gs.unoCalledBy = null
      gs.currentPlayer = getNextPlayer(myIndex, gs.direction)
      setMsg(`😱 Kena draw ${count}! Giliran lawan`)
      pushState(gs)
      return
    }

    if (!gs.deck.length) refillDeck(gs)
    const card = gs.deck.pop()!
    gs.hands[myIndex].push(card)
    gs.unoCalledBy = null
    const top = gs.discard[gs.discard.length - 1]
    if (canPlay(card, top, gs.currentColor)) {
      setMsg('🃏 Draw 1 — bisa dimainkan kalau mau!')
    } else {
      gs.currentPlayer = getNextPlayer(myIndex, gs.direction)
      setMsg('🃏 Draw 1 — giliran lawan')
    }
    pushState(gs)
  }

  // callUno sekarang tidak dipakai dari tombol manual (digantikan UnoBanner),
  // tapi tetap ada untuk backward-compat / edge case
  function callUno() {
    if (!gameState) return
    if (gameState.hands[myIndex].length !== 1) { setMsg('Kamu harus punya 1 kartu!'); return }
    const gs: GameState = JSON.parse(JSON.stringify(gameState))
    gs.unoCalledBy = myIndex
    pushState(gs)
    setMsg('🚨 UNO!')
  }

  function challengeUno() {
    if (!gameState) return
    const opp = myIndex === 0 ? 1 : 0
    if (gameState.hands[opp].length !== 1 || gameState.unoCalledBy === opp) {
      setMsg('Tidak bisa challenge sekarang!'); return
    }
    const gs: GameState = JSON.parse(JSON.stringify(gameState))
    for (let i = 0; i < 2; i++) {
      if (!gs.deck.length) refillDeck(gs)
      gs.hands[opp].push(gs.deck.pop()!)
    }
    gs.unoCalledBy = null
    pushState(gs)
    setMsg('⚡ Challenge berhasil! Lawan +2!')
    setUnoChallenged(true)
    setTimeout(() => setUnoChallenged(false), 3000)
  }

  async function doRematch() {
    if (!gameId || !gameState) return
    const prevScores: [number, number] = gameState.scores ?? [0, 0]
    const newGs = buildInitialState(gameState.startCards)
    newGs.scores = prevScores
    newGs.rematchRequestedBy = null
    // Push ke DB — lawan terima via listener, kita update lokal
    await supabase.from('uno_games').update({ state: newGs, status: 'playing', updated_at: new Date().toISOString() }).eq('id', gameId)
    setGameState(newGs)
    setSelectedCards([])
    setMsg('')
    setRematchReady(false)
    hadWinnerRef.current = false
    setPhase('playing')
  }

  async function copyInvite() {
    const url = `${window.location.origin}/games/uno?join=${inviteCode}`
    try { await navigator.clipboard.writeText(url) } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 2500)
  }

  // ─── SETUP SCREEN ─────────────────────────────────────────────────────────
  if (phase === 'setup') return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 60% 30%, #1a3a6e 0%, #0a1628 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: '"Nunito", "Arial Rounded MT Bold", sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        input:focus { outline: none !important; border-color: #E8192C !important; box-shadow: 0 0 0 3px rgba(232,25,44,0.2) !important; }
      `}</style>
      <div style={{ position: 'fixed', top: 40, left: 40, animation: 'float 3s ease-in-out infinite', opacity: 0.4 }}>
        <UnoCardSVG card={{ id: -1, color: 'red', type: 'number', value: '7' }} size="lg" />
      </div>
      <div style={{ position: 'fixed', bottom: 60, right: 60, animation: 'float 3.5s ease-in-out infinite 0.5s', opacity: 0.3 }}>
        <UnoCardSVG card={{ id: -2, color: 'blue', type: 'skip', value: 'skip' }} size="lg" />
      </div>
      <div style={{ position: 'fixed', top: 80, right: 80, animation: 'float 4s ease-in-out infinite 1s', opacity: 0.25 }}>
        <UnoCardSVG card={{ id: -3, color: 'wild', type: 'wild', value: 'wild' }} size="md" />
      </div>
      <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', borderRadius: 28, border: '1px solid rgba(255,255,255,0.12)', padding: '40px 32px', maxWidth: 420, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
        <Link href="/games" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85em', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24, fontWeight: 700 }}>← Back</Link>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-block', background: '#E8192C', borderRadius: 16, padding: '8px 28px', marginBottom: 12, boxShadow: '0 4px 20px rgba(232,25,44,0.4)' }}>
            <span style={{ color: 'white', fontWeight: 900, fontSize: '2.2em', fontFamily: '"Arial Black", sans-serif', letterSpacing: 4, textShadow: '2px 2px 0 #9B0018' }}>UNO</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.9em' }}>Main bareng pasangan secara online!</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.78em', fontWeight: 800, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>👤 Nama Kamu</label>
            <input value={myName} onChange={e => setMyName(e.target.value)} placeholder="Masukkan nama..." style={{ width: '100%', padding: '12px 16px', border: '2px solid rgba(255,255,255,0.12)', borderRadius: 12, fontSize: '0.95em', color: 'white', background: 'rgba(255,255,255,0.07)', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border 0.2s' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78em', fontWeight: 800, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>🃏 Jumlah Kartu Awal</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[5, 7, 10].map(n => (
                <button key={n} onClick={() => setStartCards(n)} style={{ flex: 1, padding: '10px', borderRadius: 10, background: startCards === n ? '#E8192C' : 'rgba(255,255,255,0.07)', color: 'white', border: startCards === n ? '2px solid #FF6B7A' : '2px solid rgba(255,255,255,0.12)', fontWeight: 800, cursor: 'pointer', fontSize: '1em', fontFamily: 'inherit', boxShadow: startCards === n ? '0 4px 16px rgba(232,25,44,0.4)' : 'none', transition: 'all 0.15s' }}>{n} kartu</button>
              ))}
            </div>
          </div>
          {msg && <p style={{ margin: 0, color: '#FF6B7A', fontSize: '0.85em', fontWeight: 700, textAlign: 'center' }}>{msg}</p>}
          <button onClick={createGame} disabled={creating} style={{ padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg, #E8192C, #9B0018)', color: 'white', border: 'none', fontWeight: 900, cursor: 'pointer', fontSize: '1em', boxShadow: '0 4px 20px rgba(232,25,44,0.4)', opacity: creating ? 0.7 : 1, fontFamily: 'inherit', letterSpacing: 0.5, transition: 'opacity 0.2s' }}>
            {creating ? '⏳ Membuat game...' : '🎮 Buat Game Baru'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8em', fontWeight: 700 }}>atau</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78em', fontWeight: 800, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>🔗 Join pakai kode invite</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={inviteInput} onChange={e => { setInviteInput(e.target.value.toUpperCase()); setMsg('') }} placeholder="Kode invite..." style={{ flex: 1, padding: '12px 16px', border: '2px solid rgba(255,255,255,0.12)', borderRadius: 12, fontSize: '0.95em', color: 'white', background: 'rgba(255,255,255,0.07)', fontFamily: 'monospace', letterSpacing: 3, boxSizing: 'border-box' }} maxLength={8} onKeyDown={e => e.key === 'Enter' && joinGame()} />
              <button onClick={joinGame} disabled={joining || !inviteInput} style={{ padding: '12px 18px', borderRadius: 12, background: inviteInput ? 'linear-gradient(135deg, #0056A6, #003070)' : 'rgba(255,255,255,0.05)', color: inviteInput ? 'white' : 'rgba(255,255,255,0.3)', border: 'none', fontWeight: 800, cursor: inviteInput ? 'pointer' : 'not-allowed', fontSize: '0.9em', whiteSpace: 'nowrap', fontFamily: 'inherit', boxShadow: inviteInput ? '0 4px 16px rgba(0,86,166,0.4)' : 'none', transition: 'all 0.2s' }}>
                {joining ? '⏳' : 'Join →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ─── WAITING SCREEN ───────────────────────────────────────────────────────
  if (phase === 'waiting') return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 60% 30%, #1a3a6e 0%, #0a1628 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: '"Nunito", sans-serif' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');`}</style>
      <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: 28, border: '1px solid rgba(255,255,255,0.12)', padding: '40px 32px', maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
        <div style={{ fontSize: '3em', marginBottom: 12 }}>⏳</div>
        <h2 style={{ fontWeight: 900, color: 'white', margin: '0 0 8px', fontSize: '1.4em' }}>Menunggu Lawan...</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 24px', fontSize: '0.9em' }}>Kirim link ini ke pasangan kamu!</p>
        <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: '16px 20px', marginBottom: 16, border: '1px solid rgba(255,255,255,0.12)' }}>
          <p style={{ margin: '0 0 8px', fontSize: '0.72em', color: 'rgba(255,255,255,0.4)', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' }}>Kode Invite</p>
          <p style={{ margin: 0, fontWeight: 900, color: 'white', fontSize: '2.2em', letterSpacing: 8, fontFamily: 'monospace' }}>{inviteCode}</p>
        </div>
        <button onClick={copyInvite} style={{ width: '100%', padding: '14px', borderRadius: 14, background: copied ? 'linear-gradient(135deg, #009C48, #006630)' : 'linear-gradient(135deg, #E8192C, #9B0018)', color: 'white', border: 'none', fontWeight: 900, cursor: 'pointer', fontSize: '0.95em', marginBottom: 12, transition: 'background 0.3s', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(232,25,44,0.3)' }}>
          {copied ? '✅ Link tersalin!' : '📋 Copy Link Invite'}
        </button>
        <p style={{ margin: '0 0 4px', fontSize: '0.78em', color: 'rgba(255,255,255,0.4)' }}>Atau bagikan kode: <strong style={{ color: 'white', fontFamily: 'monospace' }}>{inviteCode}</strong></p>
        <p style={{ margin: '0 0 20px', fontSize: '0.72em', color: 'rgba(255,255,255,0.3)' }}>Link: <code>/games/uno?join={inviteCode}</code></p>
        <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.15)', borderTopColor: '#E8192C', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
      </div>
    </div>
  )

  // ─── GAME SCREEN ──────────────────────────────────────────────────────────
  if (!gameState) return <div style={{ padding: 40, textAlign: 'center', color: 'white', background: '#0a1628', minHeight: '100vh' }}>Loading...</div>

  const top = gameState.discard[gameState.discard.length - 1]
  const myHand = gameState.hands[myIndex]
  const oppHand = gameState.hands[myIndex === 0 ? 1 : 0]
  const isMyTurn = gameState.currentPlayer === myIndex
  const opp = myIndex === 0 ? 1 : 0
  const myDisplayName = myName.trim() || `Player ${myIndex + 1}`
  const oppDisplayName = opponentName || `Player ${opp + 1}`
  const oppHasOne = oppHand.length === 1
  // Tombol challenge muncul hanya jika:
  // 1. Lawan punya 1 kartu
  // 2. Lawan belum call UNO
  // 3. Window countdown lawan SUDAH tutup (unoWindowOpen false)
  // 4. Sekarang giliran KITA (artinya lawan sudah selesai main & commit state)
  const oppForgotUno = oppHasOne
    && gameState.unoCalledBy !== opp
    && !gameState.unoWindowOpen
    && isMyTurn
  const canPlaySelected = selectedCards.length > 0

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 0%, #0d2a4a 0%, #060d1a 60%)', fontFamily: '"Nunito", sans-serif', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
        @keyframes cardDrop{0%{transform:translateY(-30px) scale(0.8);opacity:0}100%{transform:translateY(0) scale(1);opacity:1}}
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(232,25,44,0.3)}50%{box-shadow:0 0 40px rgba(232,25,44,0.7)}}
      `}</style>

      {/* UNO Banner — hanya muncul untuk pemain yang kartunya tinggal 1 */}
      {showUnoBanner && (
        <UnoBanner countdown={unoCountdown} onCall={handleUnoCall} />
      )}

      {showRules && <RulesPanel onClose={() => setShowRules(false)} />}

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/games" style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, textDecoration: 'none', fontSize: '0.85em' }}>← Games</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: `${COLOR_HEX[gameState.currentColor]}25`, border: `2px solid ${COLOR_HEX[gameState.currentColor]}`, borderRadius: 20, padding: '4px 14px', color: COLOR_HEX[gameState.currentColor], fontWeight: 800, fontSize: '0.8em' }}>
            ● {gameState.currentColor.toUpperCase()}
          </div>
          {/* Skor mini di tengah top bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '4px 12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontWeight: 900, color: 'white', fontSize: '0.9em', fontFamily: '"Arial Black", sans-serif' }}>{scores[myIndex]}</span>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75em', fontWeight: 700 }}>:</span>
            <span style={{ fontWeight: 900, color: 'white', fontSize: '0.9em', fontFamily: '"Arial Black", sans-serif' }}>{scores[opp]}</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8em', fontWeight: 700 }}>
            {isMyTurn ? '▶ Giliran kamu' : '⏳ Giliran lawan'}
          </span>
        </div>
        <button onClick={() => setShowRules(v => !v)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', borderRadius: 10, cursor: 'pointer', fontSize: '0.8em', fontWeight: 700, padding: '6px 12px', fontFamily: 'inherit' }}>📖 Aturan</button>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '12px 12px 120px' }}>

        {unoAlert && <div style={{ textAlign: 'center', padding: '8px 16px', marginBottom: 10, background: '#FFD900', borderRadius: 12, fontWeight: 900, color: '#333', fontSize: '1em', animation: 'glow 1s infinite' }}>{unoAlert}</div>}
        {unoChallenged && <div style={{ textAlign: 'center', padding: '8px 16px', marginBottom: 10, background: '#fecaca', borderRadius: 12, fontWeight: 900, color: '#991b1b' }}>⚡ Challenge berhasil! Lawan dapat +2 kartu!</div>}

        {gameState.pendingDraw > 0 && (
          <div style={{ textAlign: 'center', padding: '10px 16px', marginBottom: 10, background: isMyTurn ? '#E8192C' : '#7f1d1d', borderRadius: 12, fontWeight: 900, color: 'white', fontSize: '1em', border: '2px solid rgba(255,255,255,0.2)', animation: isMyTurn ? 'glow 1s infinite' : 'none' }}>
            {isMyTurn
              ? `⚠️ Kamu harus ambil ${gameState.pendingDraw} kartu! Nangkis dengan +2/+4 atau tap deck.`
              : `🔥 Lawan harus ambil ${gameState.pendingDraw} kartu — atau nangkis!`
            }
          </div>
        )}

        {/* Opponent area */}
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: '14px 16px', marginBottom: 12, border: `1.5px solid ${!isMyTurn ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.06)'}`, boxShadow: !isMyTurn ? '0 0 24px rgba(255,255,255,0.05)' : 'none', transition: 'border 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.82em', fontWeight: 800 }}>
              🎭 {oppDisplayName} — <span style={{ color: oppHand.length <= 2 ? '#FFD900' : 'inherit' }}>{oppHand.length} kartu</span>
              {!isMyTurn && <span style={{ color: '#4DC878', marginLeft: 6 }}>▶ GILIRAN</span>}
            </p>
            {oppForgotUno && (
              <button onClick={challengeUno} style={{ padding: '5px 12px', borderRadius: 8, background: '#E8192C', color: 'white', border: 'none', fontWeight: 900, cursor: 'pointer', fontSize: '0.78em', animation: 'pulse 0.8s infinite', fontFamily: 'inherit' }}>⚡ Lupa UNO!</button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {oppHand.map((_, i) => (
              <UnoCardSVG key={i} card={{ id: -100 - i, color: 'wild', type: 'number', value: '' }} size="sm" faceDown />
            ))}
          </div>
        </div>

        {/* Center play area */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, marginBottom: 12, padding: '20px 0' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 6px', color: 'rgba(255,255,255,0.3)', fontSize: '0.65em', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Deck ({gameState.deck.length})</p>
            <div onClick={isMyTurn ? drawCard : undefined} style={{ cursor: isMyTurn ? 'pointer' : 'default', transition: 'transform 0.15s', transform: 'scale(1)' }}
              onMouseEnter={e => isMyTurn && ((e.currentTarget as HTMLElement).style.transform = 'scale(1.05)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
            >
              <UnoCardSVG card={{ id: -200, color: 'wild', type: 'number', value: '' }} size="lg" faceDown disabled={!isMyTurn} />
            </div>
            {isMyTurn && <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.65em' }}>Tap ambil</p>}
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 6px', color: 'rgba(255,255,255,0.3)', fontSize: '0.65em', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Discard</p>
            <div style={{ animation: lastPlayedAnim ? 'cardDrop 0.35s ease' : 'none' }}>
              {top && <UnoCardSVG card={{ ...top, color: gameState.currentColor }} size="lg" />}
            </div>
          </div>
        </div>

        {msg && <p style={{ textAlign: 'center', color: '#FFD900', fontWeight: 700, fontSize: '0.85em', margin: '0 0 10px', animation: 'shake 0.4s ease' }}>{msg}</p>}

        {/* My hand */}
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: '14px 16px', border: `1.5px solid ${isMyTurn ? 'rgba(232,25,44,0.4)' : 'rgba(255,255,255,0.06)'}`, boxShadow: isMyTurn ? '0 0 24px rgba(232,25,44,0.08)' : 'none', transition: 'border 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.82em', fontWeight: 800 }}>
              👤 {myDisplayName} — <span style={{ color: myHand.length <= 2 ? '#FFD900' : 'inherit' }}>{myHand.length} kartu</span>
              {isMyTurn && <span style={{ color: '#E8192C', marginLeft: 6 }}>▶ GILIRAN</span>}
            </p>
            {/* Badge UNO sudah dipanggil */}
            {myHand.length === 1 && gameState.unoCalledBy === myIndex && (
              <span style={{ padding: '4px 12px', borderRadius: 8, background: '#009C48', color: 'white', fontWeight: 800, fontSize: '0.78em' }}>✅ UNO!</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 78 }}>
            {myHand.map((card, i) => {
              const firstSelected = selectedCards.length > 0 ? myHand[selectedCards[0]] : null
              const playable = isMyTurn && (
                selectedCards.includes(i) ? true
                : firstSelected ? card.value === firstSelected.value
                : gameState.pendingDraw > 0 ? canCounter(card)
                : canPlay(card, top, gameState.currentColor)
              )
              const isSelected = selectedCards.includes(i)
              return (
                <UnoCardSVG
                  key={card.id}
                  card={card}
                  size="md"
                  selected={isSelected}
                  disabled={!playable}
                  onClick={() => toggleSelect(i)}
                />
              )
            })}
          </div>

          {canPlaySelected && isMyTurn && (
            <button onClick={playSelectedCards} style={{
              marginTop: 14, width: '100%', padding: '12px', borderRadius: 14,
              background: `linear-gradient(135deg, ${COLOR_HEX[myHand[selectedCards[0]]?.color] || '#E8192C'}, ${COLOR_DARK[myHand[selectedCards[0]]?.color] || '#9B0018'})`,
              color: 'white', border: 'none', fontWeight: 900, cursor: 'pointer', fontSize: '0.95em',
              fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', transition: 'opacity 0.15s',
            }}>
              ▶ Mainkan {selectedCards.length > 1 ? `${selectedCards.length} kartu` : 'kartu ini'}
            </button>
          )}
          {!canPlaySelected && isMyTurn && (
            <p style={{ textAlign: 'center', margin: '10px 0 0', color: 'rgba(255,255,255,0.3)', fontSize: '0.78em' }}>Pilih kartu untuk dimainkan, atau ambil dari deck</p>
          )}
        </div>
      </div>

      {/* Wild color picker modal */}
      {wildPicker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#0f1729', borderRadius: 24, padding: '28px 24px', textAlign: 'center', maxWidth: 300, width: '90%', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
            <p style={{ fontWeight: 900, color: 'white', margin: '0 0 20px', fontSize: '1.1em' }}>🌈 Pilih warna:</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {(['red', 'yellow', 'green', 'blue'] as Color[]).map(c => (
                <button key={c} onClick={() => {
                  setWildPicker(false)
                  if (!gameState) return
                  const cards = pendingCardIdxs.map(i => gameState.hands[myIndex][i])
                  setPendingCardIdxs([])
                  applyPlay(pendingCardIdxs, cards, c)
                }} style={{
                  padding: '18px 12px', borderRadius: 14,
                  background: `linear-gradient(135deg, ${COLOR_HEX[c]}, ${COLOR_DARK[c]})`,
                  color: c === 'yellow' ? '#333' : 'white', border: 'none', fontWeight: 900,
                  cursor: 'pointer', fontSize: '0.9em', textTransform: 'capitalize',
                  fontFamily: 'inherit', boxShadow: `0 4px 16px ${COLOR_HEX[c]}66`,
                }}>{c === 'red' ? '🔴' : c === 'yellow' ? '🟡' : c === 'green' ? '🟢' : '🔵'} {c}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Game Over modal */}
      {phase === 'finished' && gameState.winner !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, backdropFilter: 'blur(6px)' }}>
          <div style={{ background: '#0f1729', borderRadius: 28, padding: '36px 28px', maxWidth: 360, width: '92%', textAlign: 'center', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}>

            {/* Hasil */}
            <div style={{ fontSize: '3.5em', marginBottom: 8 }}>{gameState.winner === myIndex ? '🏆' : '😢'}</div>
            <h2 style={{ fontWeight: 900, color: 'white', margin: '0 0 4px', fontSize: '1.4em' }}>
              {gameState.winner === myIndex ? 'Kamu Menang! 🎉' : `${oppDisplayName} Menang!`}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', margin: '0 0 20px', fontSize: '0.85em' }}>
              {gameState.winner === myIndex ? 'Kartu habis duluan!' : 'Coba lagi!'}
            </p>

            {/* Scoreboard */}
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '16px 20px', marginBottom: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ margin: '0 0 12px', fontSize: '0.7em', fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase' }}>Skor</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
                {/* Player kita */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '0.78em', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>{myDisplayName}</p>
                  <p style={{ margin: 0, fontSize: '2.8em', fontWeight: 900, color: gameState.winner === myIndex ? '#FFD900' : 'white', fontFamily: '"Arial Black", sans-serif', lineHeight: 1, textShadow: gameState.winner === myIndex ? '0 0 20px rgba(255,217,0,0.5)' : 'none' }}>
                    {scores[myIndex]}
                  </p>
                </div>
                {/* Divider */}
                <div style={{ padding: '0 16px', fontSize: '1.4em', color: 'rgba(255,255,255,0.2)', fontWeight: 900 }}>:</div>
                {/* Lawan */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '0.78em', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>{oppDisplayName}</p>
                  <p style={{ margin: 0, fontSize: '2.8em', fontWeight: 900, color: gameState.winner === opp ? '#FFD900' : 'white', fontFamily: '"Arial Black", sans-serif', lineHeight: 1, textShadow: gameState.winner === opp ? '0 0 20px rgba(255,217,0,0.5)' : 'none' }}>
                    {scores[opp]}
                  </p>
                </div>
              </div>
            </div>

            {/* Tombol */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={doRematch}
                style={{
                  flex: 1, padding: '13px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #E8192C, #9B0018)',
                  color: 'white', border: 'none', fontWeight: 800,
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 4px 16px rgba(232,25,44,0.4)',
                  fontSize: '0.92em',
                }}
              >
                🔄 Rematch
              </button>
              <button
                onClick={() => { setPhase('setup'); setGameId(null); setGameState(null); setInviteCode(null); setSelectedCards([]); setScores([0,0]); setRematchReady(false) }}
                style={{ padding: '13px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85em', whiteSpace: 'nowrap' }}
              >
                🚪 Keluar
              </button>
            </div>
            <p style={{ margin: '10px 0 0', color: 'rgba(255,255,255,0.2)', fontSize: '0.72em' }}>Keluar akan reset skor</p>
          </div>
        </div>
      )}
    </div>
  )
}