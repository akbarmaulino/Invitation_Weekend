'use client'

import Link from 'next/link'
import Navbar from '@/components/ui/Navbar'

const P = '#03254c', S = '#c4e8ff', BG = '#d0efff', BGM = '#e1f3ff', MUTED = '#a0a0b5'

const GAMES = [
  {
    href: '/games/ular-tangga',
    icon: '🐍',
    title: 'Ular Tangga',
    desc: 'Board game klasik berdua. Naik tangga, hindari ular!',
    players: '2 pemain',
    duration: '10–20 menit',
    difficulty: 'Easy',
    color: '#22c55e',
    bg: '#f0fdf4',
    ready: true,
  },
  {
    href: '/games/uno',
    icon: '🃏',
    title: 'Uno',
    desc: 'Habiskan kartu duluan. Jangan lupa teriak UNO!',
    players: '2 pemain',
    duration: '15–30 menit',
    difficulty: 'Medium',
    color: '#f59e0b',
    bg: '#fffbeb',
    ready: true,
  },
  {
    href: '/games/blackjack',
    icon: '🂡',
    title: 'Blackjack',
    desc: 'Tantang dealer, raih 21 tanpa bust!',
    players: '1 vs dealer',
    duration: '5–15 menit',
    difficulty: 'Medium',
    color: '#6366f1',
    bg: '#eef2ff',
    ready: true,
  },
  {
    href: '/games/memory-match',
    icon: '🎴',
    title: 'Memory Match',
    desc: 'Temukan semua pasangan kartu sebelum waktu habis!',
    players: '2 pemain',
    duration: '5–10 menit',
    difficulty: 'Easy',
    color: '#ec4899',
    bg: '#fdf2f8',
    ready: true,
  },
]

const DIFF_COLOR: Record<string, string> = {
  Easy: '#22c55e',
  Medium: '#f59e0b',
  Hard: '#ef4444',
}

export default function GamesPage() {
  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${BG}, ${BGM})` }}>
      <Navbar />

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 16px 80px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: '3.5em', marginBottom: 12 }}>🎮</div>
          <h1 style={{ fontWeight: 900, fontSize: '2.2em', color: P, margin: '0 0 10px', letterSpacing: -0.5 }}>Game Zone</h1>
          <p style={{ color: MUTED, margin: 0, fontSize: '1em' }}>Main bareng pasangan biar makin seru! 💕</p>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 40 }}>
          {[['🎯', `${GAMES.length}`, 'Game tersedia'], ['👥', '2', 'Pemain'], ['🆓', '100%', 'Gratis']].map(([icon, val, lbl]) => (
            <div key={lbl} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.3em' }}>{icon}</div>
              <div style={{ fontWeight: 900, fontSize: '1.4em', color: P, lineHeight: 1.1 }}>{val}</div>
              <div style={{ fontSize: '0.72em', color: MUTED, fontWeight: 600 }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Game cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {GAMES.map(game => (
            <GameCard key={game.href} game={game} />
          ))}
        </div>

        {/* Coming soon teaser */}
        <div style={{ marginTop: 32, padding: '20px 24px', borderRadius: 20, border: `2px dashed ${S}`, background: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
          <p style={{ margin: '0 0 6px', fontSize: '1.3em' }}>🚀</p>
          <p style={{ margin: 0, fontWeight: 700, color: P, fontSize: '0.9em' }}>Lebih banyak game coming soon!</p>
          <p style={{ margin: '4px 0 0', color: MUTED, fontSize: '0.8em' }}>Ular tangga couple edition, Truth or Dare, dan lainnya</p>
        </div>

      </main>
    </div>
  )
}

function GameCard({ game }: { game: typeof GAMES[0] }) {
  return (
    <Link href={game.href} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'white', borderRadius: 24, border: `2px solid ${S}`,
        padding: 24, cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(3,37,76,0.08)',
        transition: 'all 0.2s ease',
        height: '100%', display: 'flex', flexDirection: 'column', gap: 16,
        position: 'relative', overflow: 'hidden',
      }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.transform = 'translateY(-4px)'
          el.style.boxShadow = '0 12px 32px rgba(3,37,76,0.15)'
          el.style.borderColor = P
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.transform = 'none'
          el.style.boxShadow = '0 4px 16px rgba(3,37,76,0.08)'
          el.style.borderColor = S
        }}
      >
        {/* BG decoration */}
        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: game.bg, opacity: 0.8 }} />

        {/* Icon + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: game.bg, border: `2px solid ${game.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8em', flexShrink: 0 }}>
            {game.icon}
          </div>
          <div>
            <h3 style={{ fontWeight: 900, color: P, margin: '0 0 4px', fontSize: '1.15em' }}>{game.title}</h3>
            <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: '0.72em', fontWeight: 700, background: `${DIFF_COLOR[game.difficulty]}20`, color: DIFF_COLOR[game.difficulty] }}>{game.difficulty}</span>
          </div>
        </div>

        {/* Desc */}
        <p style={{ margin: 0, color: MUTED, fontSize: '0.88em', lineHeight: 1.5, position: 'relative' }}>{game.desc}</p>

        {/* Meta */}
        <div style={{ display: 'flex', gap: 12, position: 'relative', marginTop: 'auto' }}>
          <span style={{ padding: '5px 12px', borderRadius: 999, background: BGM, color: P, fontSize: '0.78em', fontWeight: 700, border: `1.5px solid ${S}` }}>👥 {game.players}</span>
          <span style={{ padding: '5px 12px', borderRadius: 999, background: BGM, color: P, fontSize: '0.78em', fontWeight: 700, border: `1.5px solid ${S}` }}>⏱️ {game.duration}</span>
        </div>

        {/* Play button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <span style={{ fontSize: '0.82em', color: game.color, fontWeight: 700 }}>Tap untuk main →</span>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: P, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.9em' }}>▶</div>
        </div>
      </div>
    </Link>
  )
}