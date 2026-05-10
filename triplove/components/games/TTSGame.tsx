'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const P = '#03254c', S = '#c4e8ff', BG = '#d0efff', BGM = '#e1f3ff', MUTED = '#a0a0b5'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ClueItem {
  direction: 'across' | 'down'
  clueNumber: number
  clue: string
  answer: string
  row: number   // 0-indexed start row
  col: number   // 0-indexed start col
}

interface Cell {
  letter: string       // correct answer letter
  clueNumber?: number  // label shown top-left of cell
  acrossClue?: number  // which across clue this cell belongs to
  downClue?: number    // which down clue this cell belongs to
  isBlack: boolean
}

// ─── Grok AI ─────────────────────────────────────────────────────────────────
const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || ''

async function fetchPuzzleFromGrok(theme: string): Promise<ClueItem[]> {
  const prompt = `Kamu adalah pembuat teka-teki silang (TTS) seperti yang ada di koran Kompas. Buat puzzle bertema "${theme}" untuk dimainkan dua orang.

ATURAN GRID (WAJIB, JANGAN DILANGGAR):
- Buat TEPAT 8 kata: 4 mendatar (across) + 4 menurun (down)
- Setiap kata MINIMAL 4 huruf, MAKSIMAL 8 huruf
- Kata-kata HARUS saling berpotongan dengan huruf yang sama di posisi yang tepat
- Semua huruf kapital, hanya A-Z tanpa spasi atau tanda baca
- Grid 10x10 (index 0-9). Hitung dengan teliti, kata TIDAK BOLEH keluar batas:
  * across: col + jumlah_huruf <= 10 (contoh: kata 5 huruf di col 6 = TIDAK VALID karena 6+5=11)
  * down: row + jumlah_huruf <= 10 (contoh: kata 4 huruf di row 7 = TIDAK VALID karena 7+4=11)
- PERIKSA ULANG setiap kata sebelum output

ATURAN CLUE — INI YANG PALING PENTING:
Clue harus seperti TTS koran: masuk akal, bisa ditebak, tapi butuh sedikit mikir.

CONTOH CLUE YANG BAGUS:
- "Lawan kata dari benci" → CINTA
- "Bunga yang sering diberikan saat Valentine" → MAWAR  
- "Tempat makan malam romantis" → RESTORAN
- "Perasaan saat deg-degan ketemu dia" → GUGUP
- "Simbol kasih sayang berbentuk hati" → LOVE

CONTOH CLUE YANG JELEK (JANGAN SEPERTI INI):
- "Jenis perasaan positif" → terlalu umum
- "Sesuatu yang merah" → terlalu ambigu
- "Tempat untuk makan" → terlalu gampang dan membosankan

PRINSIP:
- Clue harus spesifik ke satu jawaban saja
- Tidak perlu pakai bahasa puitis atau kiasan berlebihan
- Cukup deskripsi singkat yang jelas dan mengarah ke jawaban
- Boleh pakai "lawan kata dari...", "sinonim dari...", "ibukota...", "tokoh yang...", dll

Kembalikan HANYA JSON array, tanpa penjelasan, tanpa markdown, tanpa backtick:
[
  {"direction":"across","clueNumber":1,"clue":"tulis clue di sini","answer":"JAWABAN","row":0,"col":0},
  ...
]`

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  })

  if (!res.ok) throw new Error(`Grok API error: ${res.status}`)
  const data = await res.json()
  const text: string = data.choices?.[0]?.message?.content || ''

  // Strip markdown fences if any
  const cleaned = text.replace(/```json|```/g, '').trim()
  const clues: ClueItem[] = JSON.parse(cleaned)

  const validated = clues
    .map(c => ({ ...c, answer: c.answer.toUpperCase().replace(/[^A-Z]/g, '') }))
    .filter(c => {
      // Minimum 3 huruf
      if (c.answer.length < 3) return false
      // Tidak keluar batas grid
      if (c.direction === 'across' && c.col + c.answer.length > 10) return false
      if (c.direction === 'down'   && c.row + c.answer.length > 10) return false
      // Row & col harus valid
      if (c.row < 0 || c.row > 9 || c.col < 0 || c.col > 9) return false
      return true
    })

  if (validated.length < 4) throw new Error('Puzzle tidak valid, coba generate ulang')
  return validated
}

// ─── Build grid from clues ────────────────────────────────────────────────────
function buildGrid(clues: ClueItem[], size = 10): Cell[][] {
  const grid: Cell[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ letter: '', isBlack: true }))
  )

  // Place letters
  for (const clue of clues) {
    for (let i = 0; i < clue.answer.length; i++) {
      const r = clue.direction === 'across' ? clue.row : clue.row + i
      const c = clue.direction === 'across' ? clue.col + i : clue.col
      if (r < size && c < size) {
        grid[r][c].letter = clue.answer[i]
        grid[r][c].isBlack = false
      }
    }
  }

  // Assign clue numbers to cells
  for (const clue of clues) {
    const r = clue.row, c = clue.col
    if (r < size && c < size) {
      if (!grid[r][c].clueNumber) grid[r][c].clueNumber = clue.clueNumber
      if (clue.direction === 'across') {
        for (let i = 0; i < clue.answer.length; i++) {
          if (c + i < size) grid[r][c + i].acrossClue = clue.clueNumber
        }
      } else {
        for (let i = 0; i < clue.answer.length; i++) {
          if (r + i < size) grid[r + i][c].downClue = clue.clueNumber
        }
      }
    }
  }

  return grid
}

// ─── Demo puzzle (fallback / no API key) ─────────────────────────────────────
const DEMO_CLUES: ClueItem[] = [
  { direction: 'across', clueNumber: 1, clue: 'Perasaan hangat antara dua orang', answer: 'CINTA', row: 0, col: 0 },
  { direction: 'across', clueNumber: 3, clue: 'Tempat indah untuk kencan romantis', answer: 'PANTAI', row: 2, col: 0 },
  { direction: 'across', clueNumber: 5, clue: 'Mawar merah simbol ini', answer: 'KASIH', row: 4, col: 2 },
  { direction: 'across', clueNumber: 7, clue: 'Pertemuan dua hati', answer: 'JODOH', row: 6, col: 0 },
  { direction: 'down',   clueNumber: 2, clue: 'Momen bersama yang dikenang', answer: 'INDAH', row: 0, col: 2 },
  { direction: 'down',   clueNumber: 4, clue: 'Bintang yang menemani malam', answer: 'BULAN', row: 0, col: 4 },
  { direction: 'down',   clueNumber: 6, clue: 'Hadiah kecil penuh makna', answer: 'MAWAR', row: 2, col: 0 },
  { direction: 'down',   clueNumber: 8, clue: 'Berjanji untuk selalu bersama', answer: 'SETIA', row: 2, col: 6 },
]

// ─── Validate intersections ───────────────────────────────────────────────────
function validateIntersections(clues: ClueItem[]): boolean {
  const acrossClues = clues.filter(c => c.direction === 'across')
  const downClues   = clues.filter(c => c.direction === 'down')

  // Setiap down harus berpotongan dengan minimal 1 across dengan huruf yang sama
  for (const down of downClues) {
    let hasValidIntersection = false
    for (const across of acrossClues) {
      // Cek apakah posisi berpotongan
      const intersectRow = down.row <= across.row && across.row < down.row + down.answer.length ? across.row : -1
      const intersectCol = across.col <= down.col && down.col < across.col + across.answer.length ? down.col : -1
      if (intersectRow === -1 || intersectCol === -1) continue

      // Cek hurufnya sama
      const downLetterIdx   = intersectRow - down.row
      const acrossLetterIdx = intersectCol - across.col
      if (down.answer[downLetterIdx] === across.answer[acrossLetterIdx]) {
        hasValidIntersection = true
        break
      }
    }
    if (!hasValidIntersection) return false
  }
  return true
}

// ─── Themes ───────────────────────────────────────────────────────────────────
const THEMES = ['Romantis & Cinta', 'Alam & Perjalanan', 'Makanan & Kuliner', 'Film & Hiburan', 'Hewan Lucu', 'Olahraga']

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TTSGame() {
  const [phase, setPhase] = useState<'setup' | 'loading' | 'playing' | 'finished'>('setup')
  const [theme, setTheme] = useState(THEMES[0])
  const [customTheme, setCustomTheme] = useState('')
  const [clues, setClues] = useState<ClueItem[]>([])
  const [grid, setGrid] = useState<Cell[][]>([])
  const [userInput, setUserInput] = useState<string[][]>([])
  const [selected, setSelected] = useState<{ row: number; col: number; direction: 'across' | 'down' } | null>(null)
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [names, setNames] = useState(['', ''])
  const [scores, setScores] = useState([0, 0])
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [loadingDots, setLoadingDots] = useState('')
  const GRID_SIZE = 10

  // Loading animation
  useEffect(() => {
    if (phase !== 'loading') return
    const iv = setInterval(() => setLoadingDots(d => d.length >= 3 ? '' : d + '.'), 400)
    return () => clearInterval(iv)
  }, [phase])

  // ── Start game ──────────────────────────────────────────────────────────────
  async function startGame() {
    const finalTheme = customTheme.trim() || theme
    setPhase('loading')
    setError('')

    try {
      let fetchedClues: ClueItem[]

      if (GROQ_API_KEY) {
        // Auto-retry up to 3x kalau perpotongan tidak valid
        let attempts = 0
        while (true) {
          attempts++
          fetchedClues = await fetchPuzzleFromGrok(finalTheme)
          if (validateIntersections(fetchedClues) || attempts >= 3) break
          console.warn(`Attempt ${attempts}: intersection invalid, retrying...`)
        }
      } else {
        await new Promise(r => setTimeout(r, 1200))
        fetchedClues = DEMO_CLUES
      }

      const g = buildGrid(fetchedClues, GRID_SIZE)
      const inp: string[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''))
      setClues(fetchedClues)
      setGrid(g)
      setUserInput(inp)
      setCompleted(new Set())
      setSelected(null)
      setShowAnswer(false)
      setScores([0, 0])
      setCurrentPlayer(0)
      setPhase('playing')
    } catch (e) {
      console.error(e)
      setError('Gagal generate puzzle. Coba lagi atau periksa API key Grok.')
      setPhase('setup')
    }
  }

  // ── Cell click ──────────────────────────────────────────────────────────────
  function handleCellClick(row: number, col: number) {
    if (!grid[row]?.[col] || grid[row][col].isBlack) return
    const cell = grid[row][col]

    if (selected?.row === row && selected?.col === col) {
      // Toggle direction
      const hasAcross = cell.acrossClue !== undefined
      const hasDown = cell.downClue !== undefined
      if (hasAcross && hasDown) {
        setSelected({ row, col, direction: selected.direction === 'across' ? 'down' : 'across' })
      }
    } else {
      const dir = cell.acrossClue !== undefined ? 'across' : 'down'
      setSelected({ row, col, direction: dir })
    }
  }

  // ── Keyboard input ──────────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!selected || phase !== 'playing') return
    const { row, col, direction } = selected

    if (e.key === 'Backspace') {
      const newInput = userInput.map(r => [...r])
      if (newInput[row][col]) {
        newInput[row][col] = ''
        setUserInput(newInput)
      } else {
        // Move backwards
        const pr = direction === 'down' ? row - 1 : row
        const pc = direction === 'across' ? col - 1 : col
        if (pr >= 0 && pc >= 0 && !grid[pr]?.[pc]?.isBlack) {
          setSelected({ row: pr, col: pc, direction })
          const n2 = userInput.map(r => [...r])
          n2[pr][pc] = ''
          setUserInput(n2)
        }
      }
      return
    }

    if (e.key === 'ArrowRight') { setSelected(s => s && !grid[row]?.[col + 1]?.isBlack ? { ...s, col: col + 1 } : s); return }
    if (e.key === 'ArrowLeft')  { setSelected(s => s && !grid[row]?.[col - 1]?.isBlack ? { ...s, col: col - 1 } : s); return }
    if (e.key === 'ArrowDown')  { setSelected(s => s && !grid[row + 1]?.[col]?.isBlack ? { ...s, row: row + 1 } : s); return }
    if (e.key === 'ArrowUp')    { setSelected(s => s && !grid[row - 1]?.[col]?.isBlack ? { ...s, row: row - 1 } : s); return }
    if (e.key === 'Tab') {
      e.preventDefault()
      // Move to next clue
      const dirs = ['across', 'down'] as const
      const allNums = [...new Set(clues.map(c => c.clueNumber))].sort((a, b) => a - b)
      const curClueNum = direction === 'across' ? grid[row][col].acrossClue : grid[row][col].downClue
      const idx = allNums.indexOf(curClueNum ?? 0)
      const nextNum = allNums[(idx + 1) % allNums.length]
      const nextClue = clues.find(c => c.clueNumber === nextNum)
      if (nextClue) setSelected({ row: nextClue.row, col: nextClue.col, direction: nextClue.direction })
      return
    }

    if (!/^[a-zA-Z]$/.test(e.key)) return
    const letter = e.key.toUpperCase()

    const newInput = userInput.map(r => [...r])
    newInput[row][col] = letter
    setUserInput(newInput)

    // Check if any clue completed
    const newCompleted = new Set<string>(completed)
    let pointsEarned = 0
    for (const clue of clues) {
      const key = `${clue.direction}-${clue.clueNumber}`
      if (newCompleted.has(key)) continue
      let correct = true
      for (let i = 0; i < clue.answer.length; i++) {
        const r = clue.direction === 'across' ? clue.row : clue.row + i
        const c = clue.direction === 'across' ? clue.col + i : clue.col
        if ((r === row && c === col ? letter : newInput[r][c]) !== clue.answer[i]) {
          correct = false; break
        }
      }
      if (correct) {
        newCompleted.add(key)
        pointsEarned++
      }
    }

    if (pointsEarned > 0) {
      setCompleted(newCompleted)
      setScores(s => { const n = [...s]; n[currentPlayer] += pointsEarned; return n })
      if (newCompleted.size === clues.length) { setPhase('finished'); setUserInput(newInput); return }
      setCurrentPlayer(p => p === 0 ? 1 : 0)
    }

    // Advance cursor
    const nr = direction === 'down' ? row + 1 : row
    const nc = direction === 'across' ? col + 1 : col
    if (nr < GRID_SIZE && nc < GRID_SIZE && !grid[nr]?.[nc]?.isBlack) {
      setSelected({ row: nr, col: nc, direction })
    }
  }, [selected, userInput, grid, clues, completed, currentPlayer, phase])

  // ── Highlight logic ─────────────────────────────────────────────────────────
  function isHighlighted(row: number, col: number) {
    if (!selected || !grid[row]?.[col] || grid[row][col].isBlack) return false
    const cell = grid[row][col]
    const activeClueNum = selected.direction === 'across' ? cell.acrossClue : cell.downClue
    const selCell = grid[selected.row]?.[selected.col]
    const selClueNum = selected.direction === 'across' ? selCell?.acrossClue : selCell?.downClue
    return activeClueNum !== undefined && activeClueNum === selClueNum
  }

  function isSelected(row: number, col: number) {
    return selected?.row === row && selected?.col === col
  }

  function isCompletedCell(row: number, col: number) {
    const cell = grid[row]?.[col]
    if (!cell) return false
    return (cell.acrossClue !== undefined && completed.has(`across-${cell.acrossClue}`)) ||
           (cell.downClue !== undefined && completed.has(`down-${cell.downClue}`))
  }

  // ── Active clue label ───────────────────────────────────────────────────────
  const activeClue = selected
    ? clues.find(c => {
        const selCell = grid[selected.row]?.[selected.col]
        const num = selected.direction === 'across' ? selCell?.acrossClue : selCell?.downClue
        return c.clueNumber === num && c.direction === selected.direction
      })
    : null

  // ═══════════════════════════════════════════════════════════════════════════
  // SETUP SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === 'setup') return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${BG}, ${BGM})`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 28, border: `2px solid ${S}`, padding: '36px 28px', maxWidth: 420, width: '100%', boxShadow: '0 16px 48px rgba(3,37,76,0.12)' }}>
        <Link href="/games" style={{ color: MUTED, fontSize: '0.85em', textDecoration: 'none', display: 'block', marginBottom: 20 }}>← Back</Link>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '3em', marginBottom: 8 }}>🧩</div>
          <h2 style={{ fontWeight: 900, color: P, margin: '0 0 6px' }}>Teka-Teki Silang</h2>
          <p style={{ color: MUTED, margin: 0, fontSize: '0.88em' }}>Soal dibuat AI, jawab bareng pasangan!</p>
          {!GROQ_API_KEY && (
            <div style={{ marginTop: 10, padding: '8px 14px', borderRadius: 10, background: '#fef3c7', border: '1.5px solid #fcd34d' }}>
              <p style={{ margin: 0, fontSize: '0.75em', color: '#92400e', fontWeight: 600 }}>⚠️ Mode Demo — set NEXT_PUBLIC_GROK_API_KEY untuk puzzle AI</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Player names */}
          {[0, 1].map(i => (
            <div key={i}>
              <label style={{ fontSize: '0.8em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 6 }}>
                {i === 0 ? '💙' : '💗'} Nama Player {i + 1}
              </label>
              <input
                value={names[i]}
                onChange={e => setNames(prev => { const n = [...prev]; n[i] = e.target.value; return n })}
                placeholder={`Player ${i + 1}`}
                style={{ width: '100%', padding: '10px 14px', border: `2px solid ${S}`, borderRadius: 12, fontSize: '0.95em', color: P, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}

          {/* Theme picker */}
          <div>
            <label style={{ fontSize: '0.8em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 8 }}>🎨 Pilih Tema</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {THEMES.map(t => (
                <button key={t} onClick={() => { setTheme(t); setCustomTheme('') }}
                  style={{ padding: '6px 14px', borderRadius: 999, border: `2px solid ${theme === t && !customTheme ? P : S}`, background: theme === t && !customTheme ? P : 'white', color: theme === t && !customTheme ? 'white' : P, fontSize: '0.78em', fontWeight: 700, cursor: 'pointer' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Custom theme */}
          <div>
            <label style={{ fontSize: '0.8em', fontWeight: 700, color: MUTED, display: 'block', marginBottom: 6 }}>✏️ Atau tema sendiri (opsional)</label>
            <input
              value={customTheme}
              onChange={e => setCustomTheme(e.target.value)}
              placeholder="cth: Liburan ke Bali, K-Drama..."
              style={{ width: '100%', padding: '10px 14px', border: `2px solid ${customTheme ? P : S}`, borderRadius: 12, fontSize: '0.9em', color: P, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {error && <p style={{ margin: 0, color: '#ef4444', fontSize: '0.82em', fontWeight: 600 }}>❌ {error}</p>}

          <button onClick={startGame}
            style={{ padding: '14px', borderRadius: 14, background: `linear-gradient(135deg, ${P}, #1a4d7a)`, color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '1em', boxShadow: '0 4px 16px rgba(3,37,76,0.25)' }}>
            🧩 Generate Puzzle & Mulai!
          </button>
        </div>
      </div>
    </div>
  )

  // ═══════════════════════════════════════════════════════════════════════════
  // LOADING SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === 'loading') return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${BG}, ${BGM})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3.5em', marginBottom: 16, animation: 'spin 1s linear infinite' }}>🧩</div>
        <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
        <p style={{ fontWeight: 900, color: P, fontSize: '1.1em', margin: '0 0 8px' }}>AI lagi bikin puzzle{loadingDots}</p>
        <p style={{ color: MUTED, fontSize: '0.85em', margin: 0 }}>Tunggu sebentar ya 😊</p>
      </div>
    </div>
  )

  // ═══════════════════════════════════════════════════════════════════════════
  // PLAYING SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  const acrossClues = clues.filter(c => c.direction === 'across').sort((a, b) => a.clueNumber - b.clueNumber)
  const downClues   = clues.filter(c => c.direction === 'down').sort((a, b) => a.clueNumber - b.clueNumber)

  return (
    <div
      style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${BG}, ${BGM})`, padding: '16px 12px 80px', outline: 'none' }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Link href="/games" style={{ color: P, fontWeight: 700, textDecoration: 'none', fontSize: '0.9em' }}>← Games</Link>
          <span style={{ fontWeight: 800, color: P }}>🧩 TTS</span>
          <button onClick={() => setPhase('setup')} style={{ padding: '5px 12px', borderRadius: 999, border: `2px solid ${S}`, background: 'white', color: P, fontSize: '0.75em', fontWeight: 700, cursor: 'pointer' }}>🔄 Baru</button>
        </div>

        {/* Scores */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {[0, 1].map(i => (
            <div key={i} style={{ background: 'white', borderRadius: 16, padding: '12px 14px', border: `2px solid ${currentPlayer === i && phase === 'playing' ? (i === 0 ? P : '#ec4899') : S}`, boxShadow: currentPlayer === i && phase === 'playing' ? `0 4px 16px ${i === 0 ? P : '#ec4899'}30` : 'none', transition: 'all 0.3s' }}>
              <p style={{ margin: 0, fontSize: '0.7em', color: MUTED, fontWeight: 700 }}>{currentPlayer === i && phase === 'playing' ? '▶ Giliran' : 'Menunggu'}</p>
              <p style={{ margin: '2px 0', fontWeight: 800, color: i === 0 ? P : '#ec4899', fontSize: '0.88em' }}>{i === 0 ? '💙' : '💗'} {names[i].trim() || `Player ${i + 1}`}</p>
              <p style={{ margin: 0, fontWeight: 900, color: P, fontSize: '1.4em', lineHeight: 1 }}>{scores[i]} poin</p>
            </div>
          ))}
        </div>

        {/* Active clue hint */}
        <div style={{ background: 'white', borderRadius: 14, border: `2px solid ${S}`, padding: '10px 14px', marginBottom: 12, minHeight: 44, display: 'flex', alignItems: 'center' }}>
          {activeClue ? (
            <p style={{ margin: 0, fontSize: '0.85em', color: P, fontWeight: 700 }}>
              <span style={{ color: MUTED, fontWeight: 600 }}>{activeClue.clueNumber} {activeClue.direction === 'across' ? 'Mendatar' : 'Menurun'}: </span>
              {activeClue.clue}
              {completed.has(`${activeClue.direction}-${activeClue.clueNumber}`) && <span style={{ marginLeft: 8, color: '#22c55e' }}>✓</span>}
            </p>
          ) : (
            <p style={{ margin: 0, fontSize: '0.82em', color: MUTED }}>👆 Tap kotak untuk mulai mengisi</p>
          )}
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 8, borderRadius: 999, background: BGM, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${P}, #3b82f6)`, width: `${(completed.size / clues.length) * 100}%`, transition: 'width 0.4s ease' }} />
          </div>
          <span style={{ fontSize: '0.75em', fontWeight: 700, color: P, whiteSpace: 'nowrap' }}>{completed.size}/{clues.length} kata</span>
        </div>

        {/* Grid */}
        <div style={{ background: 'white', borderRadius: 20, border: `2px solid ${S}`, padding: 8, marginBottom: 14, boxShadow: '0 4px 16px rgba(3,37,76,0.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gap: 2 }}>
            {Array.from({ length: GRID_SIZE }).map((_, row) =>
              Array.from({ length: GRID_SIZE }).map((_, col) => {
                const cell = grid[row]?.[col]
                if (!cell) return <div key={`${row}-${col}`} style={{ aspectRatio: '1', background: P, borderRadius: 2 }} />
                if (cell.isBlack) return <div key={`${row}-${col}`} style={{ aspectRatio: '1', background: P, borderRadius: 2 }} />

                const sel = isSelected(row, col)
                const hi  = isHighlighted(row, col)
                const done = isCompletedCell(row, col)
                const val = showAnswer ? cell.letter : (userInput[row]?.[col] || '')
                const wrong = val && val !== cell.letter && !showAnswer

                return (
                  <div key={`${row}-${col}`} onClick={() => handleCellClick(row, col)}
                    style={{
                      aspectRatio: '1', borderRadius: 3, border: `1.5px solid ${sel ? P : hi ? '#93c5fd' : S}`,
                      background: done ? '#dcfce7' : sel ? '#dbeafe' : hi ? '#eff6ff' : 'white',
                      cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                    {cell.clueNumber && (
                      <span style={{ position: 'absolute', top: 0, left: 1, fontSize: '0.45em', fontWeight: 800, color: sel ? P : MUTED, lineHeight: 1.2 }}>{cell.clueNumber}</span>
                    )}
                    <span style={{ fontSize: '0.75em', fontWeight: 800, color: done ? '#16a34a' : wrong ? '#ef4444' : sel ? P : P, marginTop: cell.clueNumber ? 3 : 0 }}>
                      {val}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Show answer toggle */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <button onClick={() => setShowAnswer(s => !s)}
            style={{ padding: '6px 14px', borderRadius: 999, border: `2px solid ${S}`, background: showAnswer ? BGM : 'white', color: P, fontSize: '0.78em', fontWeight: 700, cursor: 'pointer' }}>
            {showAnswer ? '🙈 Sembunyikan' : '👁️ Lihat Jawaban'}
          </button>
        </div>

        {/* Clue lists */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[{ label: '➡️ Mendatar', list: acrossClues }, { label: '⬇️ Menurun', list: downClues }].map(({ label, list }) => (
            <div key={label} style={{ background: 'white', borderRadius: 16, border: `2px solid ${S}`, padding: '12px 14px' }}>
              <p style={{ margin: '0 0 10px', fontSize: '0.78em', fontWeight: 800, color: P }}>{label}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {list.map(c => {
                  const isActive = activeClue?.clueNumber === c.clueNumber && activeClue?.direction === c.direction
                  const isDone = completed.has(`${c.direction}-${c.clueNumber}`)
                  return (
                    <div key={`${c.direction}-${c.clueNumber}`}
                      onClick={() => setSelected({ row: c.row, col: c.col, direction: c.direction })}
                      style={{ cursor: 'pointer', padding: '6px 8px', borderRadius: 8, background: isDone ? '#dcfce7' : isActive ? BGM : 'transparent', border: `1.5px solid ${isDone ? '#86efac' : isActive ? S : 'transparent'}`, transition: 'all 0.15s' }}>
                      <span style={{ fontSize: '0.72em', fontWeight: 800, color: isDone ? '#16a34a' : P }}>
                        {c.clueNumber}. {isDone ? '✓ ' : ''}{c.clue}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Winner modal */}
      {phase === 'finished' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(3,37,76,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 28, padding: '36px 28px', maxWidth: 340, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(3,37,76,0.25)' }}>
            <div style={{ fontSize: '3.5em', marginBottom: 12 }}>🏆</div>
            {scores[0] === scores[1] ? (
              <>
                <h2 style={{ fontWeight: 900, color: P, margin: '0 0 8px' }}>Seri! 🤝</h2>
                <p style={{ color: MUTED, margin: '0 0 6px' }}>Kalian sama-sama hebat!</p>
              </>
            ) : (
              <>
                <h2 style={{ fontWeight: 900, color: P, margin: '0 0 8px' }}>
                  {names[scores[0] > scores[1] ? 0 : 1].trim() || `Player ${scores[0] > scores[1] ? 1 : 2}`} Menang!
                </h2>
                <p style={{ color: MUTED, margin: '0 0 6px' }}>Puzzle selesai! 🎉</p>
              </>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', margin: '12px 0 24px' }}>
              {[0, 1].map(i => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '0.8em', color: MUTED }}>{names[i].trim() || `Player ${i + 1}`}</p>
                  <p style={{ margin: 0, fontWeight: 900, fontSize: '1.6em', color: i === 0 ? P : '#ec4899' }}>{scores[i]}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setPhase('setup')}
                style={{ flex: 1, padding: '12px', borderRadius: 12, background: P, color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}>🔄 Main Lagi</button>
              <Link href="/games"
                style={{ flex: 1, padding: '12px', borderRadius: 12, background: BGM, color: P, border: `2px solid ${S}`, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎮 Games</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}