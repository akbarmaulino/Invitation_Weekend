'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

const P = '#03254c', S = '#c4e8ff', BG = '#d0efff', BGM = '#e1f3ff', MUTED = '#a0a0b5'

// snake: head -> tail (goes down)
const SNAKES: Record<number, number> = { 99: 20, 87: 24, 62: 3, 54: 34, 17: 7 }
// ladder: bottom -> top (goes up)
const LADDERS: Record<number, number> = { 4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91 }

const PLAYERS_CFG = [
  { color: P,         emoji: '💙', label: 'Player 1' },
  { color: '#ec4899', emoji: '💗', label: 'Player 2' },
]

// Convert cell number to row,col for SVG overlay
function cellToRowCol(num: number): { row: number; col: number } {
  const r = Math.floor((num - 1) / 10) // 0=bottom, 9=top
  const isEvenRow = r % 2 === 0
  const posInRow = (num - 1) % 10
  const col = isEvenRow ? posInRow : 9 - posInRow
  const row = 9 - r
  return { row, col }
}

function cellNumber(row: number, col: number): number {
  const r = 9 - row
  return r % 2 === 0 ? r * 10 + col + 1 : r * 10 + (9 - col) + 1
}

const DICE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

export default function UlarTanggaGame() {
  const [positions, setPositions] = useState([0, 0])
  const [current, setCurrent]     = useState(0)
  const [rolling, setRolling]     = useState(false)
  const [dice, setDice]           = useState<number | null>(null)
  const [log, setLog]             = useState<string[]>([])
  const [winner, setWinner]       = useState<number | null>(null)
  const [setup, setSetup]         = useState(true)
  const [names, setNames]         = useState(['', ''])
  const [bonusRoll, setBonusRoll] = useState(false) // true = current player gets another roll
  const intervalRef               = useRef<ReturnType<typeof setInterval> | null>(null)

  const addLog = (msg: string) => setLog(prev => [msg, ...prev].slice(0, 10))

  function rollDice() {
    if (rolling || winner !== null) return
    setRolling(true)

    let count = 0
    intervalRef.current = setInterval(() => {
      setDice(Math.ceil(Math.random() * 6))
      count++
      if (count >= 12) {
        clearInterval(intervalRef.current!)
        const roll = Math.ceil(Math.random() * 6)
        setDice(roll)

        const pname = names[current].trim() || PLAYERS_CFG[current].label
        let newPos = positions[current] + roll
        let extraMsg = ''
        let getsBonus = roll === 6

        if (newPos > 100) {
          extraMsg = ` — terlalu jauh, tetap di ${positions[current]}`
          newPos = positions[current]
          getsBonus = false
        } else if (SNAKES[newPos]) {
          const to = SNAKES[newPos]
          extraMsg = ` 🐍 Kena ular! ${newPos}→${to}`
          newPos = to
          getsBonus = false
        } else if (LADDERS[newPos]) {
          const to = LADDERS[newPos]
          extraMsg = ` 🪜 Naik tangga! ${newPos}→${to}`
          newPos = to
        }

        if (getsBonus) extraMsg += ' 🎉 Dapet 6, giliran lagi!'

        addLog(`${PLAYERS_CFG[current].emoji} ${pname} dapet ${roll} → kotak ${newPos}${extraMsg}`)

        const newPositions = [...positions]
        newPositions[current] = newPos
        setPositions(newPositions)

        if (newPos === 100) {
          setWinner(current)
          setRolling(false)
          return
        }

        setTimeout(() => {
          if (getsBonus) {
            setBonusRoll(true)
          } else {
            setBonusRoll(false)
            setCurrent(c => c === 0 ? 1 : 0)
          }
          setRolling(false)
        }, 600)
      }
    }, 70)
  }

  if (setup) return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${BG}, ${BGM})`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 28, border: `2px solid ${S}`, padding: '36px 32px', maxWidth: 380, width: '100%', boxShadow: '0 16px 48px rgba(3,37,76,0.12)' }}>
        <Link href="/games" style={{ color: MUTED, fontSize: '0.85em', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>← Back</Link>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: '3em', marginBottom: 8 }}>🐍</div>
          <h2 style={{ fontWeight: 900, color: P, margin: '0 0 6px' }}>Ular Tangga</h2>
          <p style={{ color: MUTED, margin: 0, fontSize: '0.9em' }}>Siapa yang sampai 100 duluan?</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[0,1].map(i => (
            <div key={i}>
              <label style={{ fontSize: '0.8em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 6 }}>{PLAYERS_CFG[i].emoji} Nama Player {i+1}</label>
              <input value={names[i]} onChange={e => setNames(prev => { const n=[...prev]; n[i]=e.target.value; return n })} placeholder={`Player ${i+1}`} style={{ width: '100%', padding: '10px 14px', border: `2px solid ${S}`, borderRadius: 12, fontSize: '0.95em', color: P, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
          <button onClick={() => setSetup(false)} style={{ padding: '14px', borderRadius: 14, background: `linear-gradient(135deg, ${P}, #1a4d7a)`, color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '1em', boxShadow: '0 4px 16px rgba(3,37,76,0.25)' }}>🎮 Mulai Main!</button>
        </div>
      </div>
    </div>
  )

  const cellSize = 100 / 10 // percent per cell

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${BG}, ${BGM})`, padding: '16px 12px 80px' }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Link href="/games" style={{ color: P, fontWeight: 700, textDecoration: 'none', fontSize: '0.9em' }}>← Games</Link>
          <span style={{ fontWeight: 800, color: P }}>🐍 Ular Tangga</span>
          <div style={{ width: 60 }} />
        </div>

        {/* Player status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {[0,1].map(i => (
            <div key={i} style={{ background: 'white', borderRadius: 16, padding: '12px 14px', border: `2px solid ${current === i && !winner ? PLAYERS_CFG[i].color : S}`, boxShadow: current === i && !winner ? `0 4px 16px ${PLAYERS_CFG[i].color}30` : 'none', transition: 'all 0.3s' }}>
              <p style={{ margin: 0, fontSize: '0.7em', color: MUTED, fontWeight: 700 }}>
                {current === i && !winner ? (bonusRoll ? '🎉 Giliran lagi!' : '▶ Giliran') : 'Menunggu'}
              </p>
              <p style={{ margin: '2px 0', fontWeight: 800, color: PLAYERS_CFG[i].color, fontSize: '0.88em' }}>{PLAYERS_CFG[i].emoji} {names[i].trim() || `Player ${i+1}`}</p>
              <p style={{ margin: 0, fontWeight: 900, color: P, fontSize: '1.4em', lineHeight: 1 }}>Kotak {positions[i]}</p>
            </div>
          ))}
        </div>

        {/* Board */}
        <div style={{ background: 'white', borderRadius: 20, border: `2px solid ${S}`, padding: 8, marginBottom: 14, boxShadow: '0 4px 16px rgba(3,37,76,0.08)', position: 'relative' }}>

          {/* Grid cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 2, position: 'relative' }}>
            {Array.from({ length: 10 }).map((_, row) =>
              Array.from({ length: 10 }).map((_, col) => {
                const num = cellNumber(row, col)
                const isSnakeHead = num in SNAKES
                const isLadderBot = num in LADDERS
                const isSnakeTail = Object.values(SNAKES).includes(num)
                const isLadderTop = Object.values(LADDERS).includes(num)
                const p1here = positions[0] === num
                const p2here = positions[1] === num
                const isStart = num === 1
                const isEnd = num === 100
                const bgColor = isEnd ? '#fef08a' : isStart ? '#bbf7d0' : (row + col) % 2 === 0 ? BGM : 'white'

                return (
                  <div key={num} style={{
                    borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    background: bgColor, border: `1px solid ${S}`,
                    padding: '1px', minHeight: 40, position: 'relative',
                    outline: isSnakeHead ? '2px solid #ef4444' : isLadderBot ? '2px solid #22c55e' : 'none',
                    outlineOffset: '-2px',
                  }}>
                    <span style={{ color: MUTED, fontWeight: 700, fontSize: '0.55em', lineHeight: 1 }}>{num}</span>

                    {/* Snake/Ladder indicators */}
                    {isSnakeHead && <span style={{ fontSize: '0.7em', lineHeight: 1 }}>🐍</span>}
                    {isLadderBot && <span style={{ fontSize: '0.7em', lineHeight: 1 }}>🪜</span>}
                    {isSnakeTail && !isSnakeHead && <span style={{ fontSize: '0.55em', lineHeight: 1, color: '#ef4444', fontWeight: 800 }}>↓🐍</span>}
                    {isLadderTop && !isLadderBot && <span style={{ fontSize: '0.55em', lineHeight: 1, color: '#22c55e', fontWeight: 800 }}>↑🪜</span>}

                    {/* Player tokens */}
                    <div style={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {p1here && <span style={{ fontSize: '0.9em', lineHeight: 1 }}>{PLAYERS_CFG[0].emoji}</span>}
                      {p2here && <span style={{ fontSize: '0.9em', lineHeight: 1 }}>{PLAYERS_CFG[1].emoji}</span>}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Snake/Ladder legend */}
        <div style={{ background: 'white', borderRadius: 14, border: `2px solid ${S}`, padding: '10px 14px', marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ margin: 0, fontSize: '0.75em', fontWeight: 800, color: P }}>Peta Ular & Tangga:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Object.entries(SNAKES).map(([from, to]) => (
              <span key={from} style={{ padding: '3px 10px', borderRadius: 999, background: '#fecaca', color: '#991b1b', fontSize: '0.75em', fontWeight: 700 }}>🐍 {from}→{to}</span>
            ))}
            {Object.entries(LADDERS).map(([from, to]) => (
              <span key={from} style={{ padding: '3px 10px', borderRadius: 999, background: '#bbf7d0', color: '#14532d', fontSize: '0.75em', fontWeight: 700 }}>🪜 {from}→{to}</span>
            ))}
          </div>
        </div>

        {/* Dice + Roll button */}
        <div style={{ background: 'white', borderRadius: 20, border: `2px solid ${S}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 12px rgba(3,37,76,0.08)', marginBottom: 14 }}>
          <div style={{ fontSize: '2.8em', lineHeight: 1, minWidth: 48, textAlign: 'center', transition: 'all 0.1s' }}>{dice ? DICE_FACES[dice] : '🎲'}</div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 6px', fontWeight: 700, color: P, fontSize: '0.88em' }}>
              {PLAYERS_CFG[current].emoji} {names[current].trim() || PLAYERS_CFG[current].label}
              {bonusRoll && <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 999, background: '#fef08a', color: '#713f12', fontSize: '0.8em' }}>+1 giliran!</span>}
            </p>
            <button onClick={rollDice} disabled={rolling || winner !== null} style={{
              padding: '10px 24px', borderRadius: 12,
              background: rolling || winner !== null ? '#e5e7eb' : `linear-gradient(135deg, ${P}, #1a4d7a)`,
              color: rolling || winner !== null ? MUTED : 'white',
              border: 'none', fontWeight: 800, cursor: rolling ? 'not-allowed' : 'pointer', fontSize: '0.95em',
              boxShadow: rolling ? 'none' : '0 4px 12px rgba(3,37,76,0.2)',
            }}>{rolling ? '🎲 Rolling...' : '🎲 Lempar Dadu!'}</button>
          </div>
        </div>

        {/* Log */}
        {log.length > 0 && (
          <div style={{ background: 'white', borderRadius: 16, border: `2px solid ${S}`, padding: '12px 16px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '0.78em', fontWeight: 700, color: MUTED }}>📜 Riwayat</p>
            {log.map((l, i) => (
              <p key={i} style={{ margin: 0, fontSize: '0.8em', color: i === 0 ? P : MUTED, fontWeight: i === 0 ? 700 : 400, padding: '3px 0', borderBottom: i < log.length-1 ? `1px solid ${BGM}` : 'none' }}>{l}</p>
            ))}
          </div>
        )}
      </div>

      {/* Winner modal */}
      {winner !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(3,37,76,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 28, padding: '36px 28px', maxWidth: 340, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(3,37,76,0.25)' }}>
            <div style={{ fontSize: '3.5em', marginBottom: 12 }}>🏆</div>
            <h2 style={{ fontWeight: 900, color: P, margin: '0 0 8px' }}>{names[winner].trim() || PLAYERS_CFG[winner].label} Menang!</h2>
            <p style={{ color: MUTED, margin: '0 0 24px' }}>Berhasil sampai kotak 100! 🎉</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setPositions([0,0]); setCurrent(0); setDice(null); setLog([]); setWinner(null); setBonusRoll(false) }} style={{ flex: 1, padding: '12px', borderRadius: 12, background: P, color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}>🔄 Main Lagi</button>
              <Link href="/games" style={{ flex: 1, padding: '12px', borderRadius: 12, background: BGM, color: P, border: `2px solid ${S}`, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎮 Games</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}