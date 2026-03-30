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
    title: 'Capsa',
    desc: 'Habiskan kartu duluan. Bomb dengan Four of a Kind!',
    players: '2–4 pemain',
    duration: '15–30 menit',
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
  // // ✨ NEW
  // {
  //   href: '/games/tts',
  //   icon: '🧩',
  //   title: 'Teka-Teki Silang',
  //   desc: 'Soal dibuat AI! Jawab bareng pasangan, siapa paling banyak?',
  //   players: '2 pemain',
  //   duration: '10–20 menit',
  //   difficulty: 'Medium',
  //   color: '#8b5cf6',
  //   bg: '#f5f3ff',
  //   ready: true,
  // },
  {
    href: '/games/congklak',
    icon: '🥥',
    title: 'Congklak',
    desc: 'Game tradisional Indonesia! Siapa yang paling banyak biji di kalang?',
    players: '2 pemain',
    duration: '10–20 menit',
    difficulty: 'Easy',
    color: '#a16207',
    bg: '#fefce8',
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

      <style>{`
        .game-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 600px) {
          .game-grid {
            grid-template-columns: 1fr;
          }
        }
        .game-card {
          background: white;
          border-radius: 22px;
          border: 2px solid ${S};
          padding: 20px;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(3,37,76,0.08);
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: relative;
          overflow: hidden;
          text-decoration: none;
        }
        .game-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(3,37,76,0.15);
          border-color: ${P};
        }
      `}</style>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 16px 80px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: '3em', marginBottom: 10 }}>🎮</div>
          <h1 style={{ fontWeight: 900, fontSize: '2em', color: P, margin: '0 0 8px', letterSpacing: -0.5 }}>Game Zone</h1>
          <p style={{ color: MUTED, margin: 0, fontSize: '0.95em' }}>Main bareng pasangan biar makin seru! 💕</p>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 36 }}>
          {[['🎯', `${GAMES.length}`, 'Game tersedia'], ['👥', '2–4', 'Pemain'], ['🆓', '100%', 'Gratis']].map(([icon, val, lbl]) => (
            <div key={lbl} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2em' }}>{icon}</div>
              <div style={{ fontWeight: 900, fontSize: '1.35em', color: P, lineHeight: 1.1 }}>{val}</div>
              <div style={{ fontSize: '0.7em', color: MUTED, fontWeight: 600 }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Game cards */}
        <div className="game-grid">
          {GAMES.map(game => (
            <Link key={game.href} href={game.href} className="game-card">
              {/* BG decoration */}
              <div style={{ position: 'absolute', top: -16, right: -16, width: 80, height: 80, borderRadius: '50%', background: game.bg, opacity: 0.9, pointerEvents: 'none' }} />

              {/* Icon + title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: game.bg, border: `2px solid ${game.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6em', flexShrink: 0 }}>
                  {game.icon}
                </div>
                <div>
                  <h3 style={{ fontWeight: 900, color: P, margin: '0 0 4px', fontSize: '1.08em' }}>{game.title}</h3>
                  <span style={{ padding: '2px 9px', borderRadius: 999, fontSize: '0.7em', fontWeight: 700, background: `${DIFF_COLOR[game.difficulty]}20`, color: DIFF_COLOR[game.difficulty] }}>{game.difficulty}</span>
                </div>
              </div>

              {/* Desc */}
              <p style={{ margin: 0, color: MUTED, fontSize: '0.85em', lineHeight: 1.5, position: 'relative' }}>{game.desc}</p>

              {/* Meta chips */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', position: 'relative', marginTop: 'auto' }}>
                <span style={{ padding: '4px 10px', borderRadius: 999, background: BGM, color: P, fontSize: '0.74em', fontWeight: 700, border: `1.5px solid ${S}`, whiteSpace: 'nowrap' }}>👥 {game.players}</span>
                <span style={{ padding: '4px 10px', borderRadius: 999, background: BGM, color: P, fontSize: '0.74em', fontWeight: 700, border: `1.5px solid ${S}`, whiteSpace: 'nowrap' }}>⏱️ {game.duration}</span>
              </div>

              {/* Play row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                <span style={{ fontSize: '0.8em', color: game.color, fontWeight: 700 }}>Tap untuk main →</span>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: P, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.85em', flexShrink: 0 }}>▶</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Coming soon */}
        <div style={{ marginTop: 28, padding: '18px 22px', borderRadius: 18, border: `2px dashed ${S}`, background: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
          <p style={{ margin: '0 0 5px', fontSize: '1.2em' }}>🚀</p>
          <p style={{ margin: 0, fontWeight: 700, color: P, fontSize: '0.88em' }}>Lebih banyak game coming soon!</p>
          <p style={{ margin: '4px 0 0', color: MUTED, fontSize: '0.78em' }}>Congklak, Ludo, dan lainnya</p>
        </div>

      </main>
    </div>
  )
}