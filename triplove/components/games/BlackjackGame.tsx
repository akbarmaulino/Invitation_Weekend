'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────
type Suit = '♣' | '♦' | '♥' | '♠'
type Phase = 'setup' | 'waiting' | 'playing' | 'finished'
type ComboType = 'single' | 'pair' | 'triple' | 'straight' | 'flush' | 'fullhouse' | 'fourkind' | 'straightflush' | 'royalflush'
type CardMode = 13 | 17 | 26

interface Card { suit: Suit; value: string; rank: number; suitRank: number }
interface Combo { cards: Card[]; type: ComboType; power: number }
interface GameState {
  hands: Card[][]
  playerCount: number
  aiSlots: number[]
  currentPlayer: number
  lastCombo: Combo | null
  lastPlayer: number | null
  consecutivePasses: number
  winner: number | null
  cardMode: CardMode
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SUITS: Suit[] = ['♣', '♦', '♥', '♠']
const VALUES = ['3','4','5','6','7','8','9','10','J','Q','K','A','2']
const SUIT_RANK: Record<Suit, number> = { '♣': 0, '♦': 1, '♥': 2, '♠': 3 }
const RED_SUITS = new Set<Suit>(['♥', '♦'])

const MODE_CONFIG: Record<CardMode, { players: number; humanOnline: number; ai: number; label: string; desc: string }> = {
  13: { players: 4, humanOnline: 2, ai: 2, label: '13 kartu', desc: '4 pemain — kamu + 1 online + 2 AI' },
  17: { players: 3, humanOnline: 2, ai: 1, label: '17 kartu', desc: '3 pemain — kamu + 1 online + 1 AI' },
  26: { players: 2, humanOnline: 2, ai: 0, label: '26 kartu', desc: '2 pemain — kamu + 1 online / AI' },
}

function makeCard(value: string, suit: Suit): Card {
  return { suit, value, rank: VALUES.indexOf(value), suitRank: SUIT_RANK[suit] }
}
function makeDeck(): Card[] {
  const deck: Card[] = []
  SUITS.forEach(suit => VALUES.forEach(value => deck.push(makeCard(value, suit))))
  return deck.sort(() => Math.random() - 0.5)
}
function cardPower(c: Card) { return c.rank * 4 + c.suitRank }
function compareCards(a: Card, b: Card) { return cardPower(a) - cardPower(b) }
function sortHand(hand: Card[]) { return [...hand].sort(compareCards) }

// ─── Combo Detection ──────────────────────────────────────────────────────────
function detectCombo(cards: Card[]): Combo | null {
  const s = [...cards].sort(compareCards)
  const n = s.length
  if (n === 1) return { cards: s, type: 'single', power: cardPower(s[0]) }
  if (n === 2) {
    if (s[0].value === s[1].value) return { cards: s, type: 'pair', power: s[1].rank * 4 + s[1].suitRank }
    return null
  }
  if (n === 3) {
    if (s[0].value === s[1].value && s[1].value === s[2].value)
      return { cards: s, type: 'triple', power: s[2].rank * 4 + s[2].suitRank }
    return null
  }
  if (n === 4) {
    if (s.every(x => x.value === s[0].value))
      return { cards: s, type: 'fourkind', power: s[0].rank * 1000 + 40000 }
    return null
  }
  if (n === 5) {
    const ranks = s.map(c => c.rank)
    const suits = s.map(c => c.suit)
    const isFlush = suits.every(x => x === suits[0])
    const isStraight = ranks.every((r, i) => i === 0 || r === ranks[i - 1] + 1)
    const counts = Object.values(s.reduce((acc, c) => { acc[c.value] = (acc[c.value] || 0) + 1; return acc }, {} as Record<string, number>)).sort((a, b) => b - a)
    const hp = s[4].rank * 4 + s[4].suitRank
    if (isFlush && isStraight) return { cards: s, type: ranks[0] === VALUES.indexOf('10') ? 'royalflush' : 'straightflush', power: hp + (ranks[0] === VALUES.indexOf('10') ? 100000 : 50000) }
    if (counts[0] === 3 && counts[1] === 2) return { cards: s, type: 'fullhouse', power: hp + 30000 }
    if (isFlush) return { cards: s, type: 'flush', power: hp + 20000 }
    if (isStraight) return { cards: s, type: 'straight', power: hp + 10000 }
    return null
  }
  return null
}

function canBeat(n: Combo, l: Combo): boolean {
  if (n.type === 'fourkind' && l.type === 'single' && l.cards[0].value === '2') return true
  if (n.type === 'fourkind' && l.type === 'fourkind') return n.power > l.power
  if (n.type === 'fourkind') return false
  if (n.type !== l.type || n.cards.length !== l.cards.length) return false
  return n.power > l.power
}

function comboLabel(t: ComboType) {
  return { single:'Single', pair:'Pair', triple:'Triple', straight:'Straight', flush:'Flush', fullhouse:'Full House', fourkind:'Four of a Kind 💣', straightflush:'Straight Flush', royalflush:'Royal Flush 👑' }[t]
}

// ─── AI Logic ─────────────────────────────────────────────────────────────────
function aiPlayCards(hand: Card[], lastCombo: Combo | null): Card[] | null {
  const sorted = sortHand(hand)
  const try_ = (cards: Card[]) => { const c = detectCombo(cards); return c && (!lastCombo || canBeat(c, lastCombo)) ? cards : null }
  const byVal = sorted.reduce((acc, c) => { acc[c.value] = [...(acc[c.value] || []), c]; return acc }, {} as Record<string, Card[]>)
  if (!lastCombo || lastCombo.type === 'single') for (const c of sorted) { const r = try_([c]); if (r) return r }
  if (!lastCombo || lastCombo.type === 'pair') for (const cs of Object.values(byVal)) { if (cs.length >= 2) { const r = try_(cs.slice(0, 2)); if (r) return r } }
  if (!lastCombo || lastCombo.type === 'triple') for (const cs of Object.values(byVal)) { if (cs.length >= 3) { const r = try_(cs.slice(0, 3)); if (r) return r } }
  if (lastCombo?.type === 'single' && lastCombo.cards[0].value === '2') for (const cs of Object.values(byVal)) { if (cs.length === 4) { const r = try_(cs); if (r) return r } }
  return null
}

// ─── Build State ──────────────────────────────────────────────────────────────
function buildInitialState(cardMode: CardMode, aiSlots: number[]): GameState {
  const cfg = MODE_CONFIG[cardMode]
  const deck = makeDeck()
  const hands: Card[][] = []
  for (let i = 0; i < cfg.players; i++) hands.push(sortHand(deck.slice(i * cardMode, (i + 1) * cardMode)))
  const starterIdx = hands.findIndex(h => h.some(c => c.value === '3' && c.suit === '♣'))
  return { hands, playerCount: cfg.players, aiSlots, currentPlayer: starterIdx, lastCombo: null, lastPlayer: null, consecutivePasses: 0, winner: null, cardMode }
}

// ─── Card UI ──────────────────────────────────────────────────────────────────
function CardUI({ card, selected, onClick, disabled, small, faceDown }: {
  card: Card; selected?: boolean; onClick?: () => void; disabled?: boolean; small?: boolean; faceDown?: boolean
}) {
  const red = RED_SUITS.has(card.suit)
  const w = small ? 34 : 52; const h = small ? 50 : 74
  if (faceDown) return (
    <div style={{ width: w, height: h, borderRadius: 8, flexShrink: 0, background: 'linear-gradient(135deg,#1e3a5f,#0a1628)', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: small ? '0.65em' : '0.9em', opacity: 0.35 }}>🂠</span>
    </div>
  )
  return (
    <div onClick={!disabled ? onClick : undefined} style={{
      width: w, height: h, borderRadius: 8, background: selected ? '#fffbeb' : 'white',
      border: `2px solid ${selected ? '#f59e0b' : 'rgba(0,0,0,0.1)'}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      boxShadow: selected ? '0 0 0 3px #f59e0b55,0 6px 16px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.25)',
      cursor: disabled ? 'not-allowed' : onClick ? 'pointer' : 'default',
      transform: selected ? 'translateY(-10px)' : 'none',
      transition: 'all 0.15s cubic-bezier(.34,1.56,.64,1)',
      flexShrink: 0, userSelect: 'none', opacity: disabled ? 0.35 : 1, gap: 1,
    }}>
      <span style={{ fontWeight: 900, fontSize: small ? '0.65em' : '0.88em', color: red ? '#e11d48' : '#1a1a2e', lineHeight: 1 }}>{card.value}</span>
      <span style={{ fontSize: small ? '0.8em' : '1.02em', color: red ? '#e11d48' : '#1a1a2e', lineHeight: 1 }}>{card.suit}</span>
    </div>
  )
}

function ComboPreview({ cards }: { cards: Card[] }) {
  if (!cards.length) return null
  const combo = detectCombo(cards)
  return (
    <div style={{ textAlign: 'center', marginTop: 8, fontSize: '0.78em', fontWeight: 800 }}>
      {combo ? <span style={{ color: '#4ade80' }}>✓ {comboLabel(combo.type)}</span> : <span style={{ color: '#f87171' }}>✗ Kombinasi tidak valid</span>}
    </div>
  )
}

function playerLabel(idx: number, myIndex: number, names: string[], aiSlots: number[]) {
  if (idx === myIndex) return names[myIndex] || 'Kamu'
  if (aiSlots.includes(idx)) return `🤖 AI ${aiSlots.indexOf(idx) + 1}`
  return names[idx] || `Player ${idx + 1}`
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BlackjackGame() {
  const [phase, setPhase]             = useState<Phase>('setup')
  const [cardMode, setCardMode]       = useState<CardMode>(13)
  const [myName, setMyName]           = useState('')
  const [myIndex, setMyIndex]         = useState(0)
  const [gameId, setGameId]           = useState<string | null>(null)
  const [inviteCode, setInviteCode]   = useState<string | null>(null)
  const [inviteInput, setInviteInput] = useState('')
  const [gameState, setGameState]     = useState<GameState | null>(null)
  const [playerNames, setPlayerNames] = useState<string[]>([])
  const [selected, setSelected]       = useState<number[]>([])
  const [msg, setMsg]                 = useState('')
  const [aiMsg, setAiMsg]             = useState('')
  const [copied, setCopied]           = useState(false)
  const [creating, setCreating]       = useState(false)
  const [joining, setJoining]         = useState(false)
  const [handOrder, setHandOrder]     = useState<number[]>([])
  const [dragIdx, setDragIdx]         = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const cfg = MODE_CONFIG[cardMode]

  useEffect(() => {
    if (!gameState) return
    const len = gameState.hands[myIndex].length
    setHandOrder(prev => {
      const valid = prev.filter(i => i < len)
      const existing = new Set(valid)
      const added = Array.from({ length: len }, (_, i) => i).filter(i => !existing.has(i))
      return [...valid, ...added]
    })
  }, [gameState?.hands[myIndex]?.length, myIndex])

  useEffect(() => {
    if (!gameState || gameState.winner !== null) return
    if (!gameState.aiSlots.includes(gameState.currentPlayer)) return
    const t = setTimeout(() => doAiTurn(gameState), 850)
    return () => clearTimeout(t)
  }, [gameState?.currentPlayer, gameState?.winner])

  useEffect(() => {
    if (!gameId) return
    const ch = supabase.channel(`capsa_${gameId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'capsa_games', filter: `id=eq.${gameId}` }, payload => {
        const row = payload.new as any
        if (row.state) setGameState(row.state as GameState)
        if (row.player_names) setPlayerNames(row.player_names)
        if (row.status === 'playing' && phase === 'waiting') setPhase('playing')
      }).subscribe()
    channelRef.current = ch
    return () => { supabase.removeChannel(ch) }
  }, [gameId, phase])

  function doAiTurn(gs: GameState) {
    const aiIdx = gs.currentPlayer
    const play = aiPlayCards(gs.hands[aiIdx], gs.lastCombo)
    const newGs: GameState = JSON.parse(JSON.stringify(gs))
    if (!play) {
      newGs.consecutivePasses++
      if (newGs.consecutivePasses >= newGs.playerCount - 1) { newGs.lastCombo = null; newGs.lastPlayer = null; newGs.consecutivePasses = 0 }
      setAiMsg(`🤖 AI ${gs.aiSlots.indexOf(aiIdx) + 1} pass`)
    } else {
      const combo = detectCombo(play)!
      play.forEach(c => { const i = newGs.hands[aiIdx].findIndex(h => h.value === c.value && h.suit === c.suit); if (i !== -1) newGs.hands[aiIdx].splice(i, 1) })
      newGs.lastCombo = combo; newGs.lastPlayer = aiIdx; newGs.consecutivePasses = 0
      if (newGs.hands[aiIdx].length === 0) { newGs.winner = aiIdx; pushState(newGs); return }
      setAiMsg(`🤖 AI ${gs.aiSlots.indexOf(aiIdx) + 1}: ${comboLabel(combo.type)}`)
    }
    newGs.currentPlayer = (aiIdx + 1) % newGs.playerCount
    pushState(newGs)
  }

  async function pushState(gs: GameState) {
    setGameState(gs)
    if (gameId) await supabase.from('capsa_games').update({ state: gs, status: gs.winner !== null ? 'finished' : 'playing' }).eq('id', gameId)
  }

  async function createOnline() {
    setCreating(true)
    const name = myName.trim() || 'Player 1'
    const code = Math.random().toString(36).slice(2, 10).toUpperCase()
    const aiSlots = Array.from({ length: cfg.ai }, (_, i) => cfg.humanOnline + i)
    const initState = buildInitialState(cardMode, aiSlots)
    const names = Array(cfg.players).fill('')
    names[0] = name
    const { data, error } = await supabase.from('capsa_games')
      .insert({ player1_name: name, player_names: names, state: initState, status: 'waiting', invite_code: code, card_mode: cardMode })
      .select().single()
    if (error || !data) { setMsg('Gagal membuat game 😢'); setCreating(false); return }
    setGameId(data.id); setInviteCode(data.invite_code); setMyIndex(0); setPlayerNames(names); setGameState(initState); setPhase('waiting'); setCreating(false)
  }

  async function joinOnline() {
    const code = inviteInput.trim().toUpperCase()
    if (!code) return
    setJoining(true)
    const { data, error } = await supabase.from('capsa_games').select('*').eq('invite_code', code).single()
    if (error || !data) { setMsg('Kode tidak ditemukan 😢'); setJoining(false); return }
    if (data.status !== 'waiting') { setMsg('Game sudah penuh atau selesai'); setJoining(false); return }
    const name = myName.trim() || 'Player 2'
    const names = [...(data.player_names || [])]; names[1] = name
    await supabase.from('capsa_games').update({ player_names: names, status: 'playing' }).eq('id', data.id)
    setGameId(data.id); setMyIndex(1); setPlayerNames(names); setGameState(data.state as GameState); setCardMode(data.card_mode as CardMode); setPhase('playing'); setJoining(false)
  }

  function startVsAI() {
    const aiSlots = Array.from({ length: cfg.players - 1 }, (_, i) => i + 1)
    const gs = buildInitialState(cardMode, aiSlots)
    const names = Array(cfg.players).fill('').map((_, i) => i === 0 ? (myName.trim() || 'Kamu') : `AI ${i}`)
    setGameState(gs); setPlayerNames(names); setMyIndex(0); setPhase('playing')
  }

  function toggleCard(idx: number) {
    if (!gameState || gameState.currentPlayer !== myIndex) { setMsg('Bukan giliran kamu!'); return }
    setSelected(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])
    setMsg('')
  }

  function playCards() {
    if (!gameState || !selected.length) return
    if (gameState.currentPlayer !== myIndex) { setMsg('Bukan giliran kamu!'); return }
    const rawHand = gameState.hands[myIndex]
    const displayHand = handOrder.length === rawHand.length ? handOrder.map(i => rawHand[i]) : rawHand
    const cards = selected.map(i => displayHand[i])
    const isFirstMove = !gameState.lastCombo && gameState.consecutivePasses === 0 && gameState.lastPlayer === null
    if (isFirstMove) {
      const has3C = rawHand.some(c => c.value === '3' && c.suit === '♣')
      if (has3C && !cards.some(c => c.value === '3' && c.suit === '♣')) { setMsg('⚠️ Kartu pertama harus menyertakan 3♣!'); return }
    }
    const combo = detectCombo(cards)
    if (!combo) { setMsg('❌ Kombinasi tidak valid!'); return }
    if (gameState.lastCombo && !canBeat(combo, gameState.lastCombo)) { setMsg('❌ Kombinasi tidak cukup kuat!'); return }
    const gs: GameState = JSON.parse(JSON.stringify(gameState))
    cards.forEach(card => { const i = gs.hands[myIndex].findIndex(c => c.value === card.value && c.suit === card.suit); if (i !== -1) gs.hands[myIndex].splice(i, 1) })
    gs.lastCombo = combo; gs.lastPlayer = myIndex; gs.consecutivePasses = 0
    if (gs.hands[myIndex].length === 0) { gs.winner = myIndex; setSelected([]); pushState(gs); return }
    gs.currentPlayer = (myIndex + 1) % gs.playerCount
    setSelected([]); setMsg(''); pushState(gs)
  }

  function pass() {
    if (!gameState || gameState.currentPlayer !== myIndex) return
    const gs: GameState = JSON.parse(JSON.stringify(gameState))
    gs.consecutivePasses++
    if (gs.consecutivePasses >= gs.playerCount - 1) { gs.lastCombo = null; gs.lastPlayer = null; gs.consecutivePasses = 0 }
    gs.currentPlayer = (myIndex + 1) % gs.playerCount
    setSelected([]); setMsg('Kamu pass'); pushState(gs)
  }

  async function copyInvite() {
    try { await navigator.clipboard.writeText(`${window.location.origin}/games/capsa?join=${inviteCode}`) } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 2500)
  }

  function resetGame() { setPhase('setup'); setGameState(null); setSelected([]); setMsg(''); setAiMsg(''); setGameId(null); setInviteCode(null); setHandOrder([]) }

  // ─── SETUP ─────────────────────────────────────────────────────────────────
  if (phase === 'setup') return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 40% 20%,#1a4020 0%,#060d08 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: '"Nunito",sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap'); input:focus{outline:none!important;border-color:#4ade80!important;box-shadow:0 0 0 3px rgba(74,222,128,.15)!important;} button{transition:all .15s;} button:hover{filter:brightness(1.08);} button:active{transform:scale(.97);}`}</style>
      <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', borderRadius: 28, border: '1px solid rgba(255,255,255,0.1)', padding: '36px 28px', maxWidth: 440, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
        <Link href="/games" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85em', textDecoration: 'none', fontWeight: 700, display: 'block', marginBottom: 24 }}>← Back</Link>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', gap: 5, marginBottom: 10 }}>
            {(['♠','♥','♦','♣'] as Suit[]).map(s => (
              <div key={s} style={{ width: 30, height: 42, borderRadius: 6, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1em', color: RED_SUITS.has(s) ? '#e11d48' : '#1a1a2e', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>{s}</div>
            ))}
          </div>
          <h2 style={{ fontWeight: 900, color: 'white', margin: '0 0 4px', fontSize: '1.7em', letterSpacing: 2 }}>CAPSA</h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', margin: 0, fontSize: '0.82em' }}>Big Two — Habiskan kartu duluan!</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: '0.7em', fontWeight: 800, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 5, letterSpacing: 1, textTransform: 'uppercase' }}>👤 Nama kamu</label>
            <input value={myName} onChange={e => setMyName(e.target.value)} placeholder="Masukkan nama..." style={{ width: '100%', padding: '11px 14px', border: '2px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: '0.9em', color: 'white', background: 'rgba(255,255,255,0.07)', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border .2s' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.7em', fontWeight: 800, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>🃏 Mode permainan</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {([13, 17, 26] as CardMode[]).map(m => (
                <button key={m} onClick={() => setCardMode(m)} style={{
                  padding: '11px 14px', borderRadius: 12, textAlign: 'left',
                  background: cardMode === m ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${cardMode === m ? '#4ade80' : 'rgba(255,255,255,0.08)'}`,
                  color: 'white', cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: cardMode === m ? '0 0 18px rgba(74,222,128,0.12)' : 'none',
                }}>
                  <div style={{ fontWeight: 900, fontSize: '0.88em' }}>{MODE_CONFIG[m].label}</div>
                  <div style={{ fontSize: '0.73em', color: 'rgba(255,255,255,0.42)', marginTop: 2 }}>{MODE_CONFIG[m].desc}</div>
                </button>
              ))}
            </div>
          </div>

          {msg && <p style={{ margin: 0, color: '#f87171', fontSize: '0.82em', fontWeight: 700, textAlign: 'center' }}>{msg}</p>}

          <button onClick={startVsAI} style={{ padding: '13px', borderRadius: 14, background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', border: 'none', fontWeight: 900, cursor: 'pointer', fontSize: '0.93em', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(22,163,74,0.3)' }}>
            🤖 Main vs AI
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.72em', fontWeight: 700 }}>atau main online</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <button onClick={createOnline} disabled={creating} style={{ padding: '13px', borderRadius: 14, background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', color: 'white', border: 'none', fontWeight: 900, cursor: 'pointer', fontSize: '0.93em', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(14,165,233,0.3)', opacity: creating ? 0.7 : 1 }}>
            {creating ? '⏳ Membuat...' : '🌐 Buat Game Online'}
          </button>

          <div>
            <label style={{ fontSize: '0.7em', fontWeight: 800, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 5, letterSpacing: 1, textTransform: 'uppercase' }}>🔗 Join kode invite</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={inviteInput} onChange={e => { setInviteInput(e.target.value.toUpperCase()); setMsg('') }} placeholder="Kode..." style={{ flex: 1, padding: '11px 14px', border: '2px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: '0.9em', color: 'white', background: 'rgba(255,255,255,0.07)', fontFamily: 'monospace', letterSpacing: 3, boxSizing: 'border-box', transition: 'border .2s' }} maxLength={8} onKeyDown={e => e.key === 'Enter' && joinOnline()} />
              <button onClick={joinOnline} disabled={joining || !inviteInput} style={{ padding: '11px 16px', borderRadius: 12, background: inviteInput ? 'linear-gradient(135deg,#0ea5e9,#0369a1)' : 'rgba(255,255,255,0.04)', color: inviteInput ? 'white' : 'rgba(255,255,255,0.2)', border: 'none', fontWeight: 800, cursor: inviteInput ? 'pointer' : 'not-allowed', fontSize: '0.85em', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                {joining ? '⏳' : 'Join →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ─── WAITING ────────────────────────────────────────────────────────────────
  if (phase === 'waiting') return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 40% 20%,#1a4020 0%,#060d08 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: '"Nunito",sans-serif' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', borderRadius: 28, border: '1px solid rgba(255,255,255,0.1)', padding: '40px 32px', maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '3em', marginBottom: 12 }}>⏳</div>
        <h2 style={{ fontWeight: 900, color: 'white', margin: '0 0 6px' }}>Menunggu Lawan...</h2>
        <p style={{ color: 'rgba(255,255,255,0.35)', margin: '0 0 20px', fontSize: '0.85em' }}>Mode: {MODE_CONFIG[cardMode].desc}</p>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '14px 20px', marginBottom: 14 }}>
          <p style={{ margin: '0 0 6px', fontSize: '0.67em', color: 'rgba(255,255,255,0.28)', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' }}>Kode Invite</p>
          <p style={{ margin: 0, fontWeight: 900, color: 'white', fontSize: '2em', letterSpacing: 8, fontFamily: 'monospace' }}>{inviteCode}</p>
        </div>
        <button onClick={copyInvite} style={{ width: '100%', padding: '13px', borderRadius: 14, background: copied ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'linear-gradient(135deg,#0ea5e9,#0369a1)', color: 'white', border: 'none', fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10, transition: 'background .3s' }}>
          {copied ? '✅ Link tersalin!' : '📋 Copy Link Invite'}
        </button>
        <p style={{ margin: '0 0 16px', fontSize: '0.7em', color: 'rgba(255,255,255,0.22)' }}>Link: <code>/games/capsa?join={inviteCode}</code></p>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.08)', borderTopColor: '#4ade80', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
      </div>
    </div>
  )

  // ─── GAME ───────────────────────────────────────────────────────────────────
  if (!gameState) return <div style={{ minHeight: '100vh', background: '#060d08', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Loading...</div>

  const rawHand = gameState.hands[myIndex]
  const myHand = handOrder.length === rawHand.length ? handOrder.map(i => rawHand[i]) : rawHand
  const isMyTurn = gameState.currentPlayer === myIndex
  const selectedCards = selected.map(i => myHand[i])
  const selectedCombo = selectedCards.length > 0 ? detectCombo(selectedCards) : null
  const isPlayable = selectedCombo !== null && (!gameState.lastCombo || canBeat(selectedCombo, gameState.lastCombo))
  const canPass = isMyTurn && gameState.lastCombo !== null && gameState.lastPlayer !== myIndex
  const others = Array.from({ length: gameState.playerCount }, (_, i) => i).filter(i => i !== myIndex)

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 0%,#0d2a12 0%,#040a06 70%)', fontFamily: '"Nunito",sans-serif', paddingBottom: 100 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
        @keyframes slideUp{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes glow{0%,100%{box-shadow:0 0 18px rgba(74,222,128,.12)}50%{box-shadow:0 0 32px rgba(74,222,128,.35)}}
      `}</style>

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/games" style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, textDecoration: 'none', fontSize: '0.8em' }}>← Games</Link>
        <span style={{ fontWeight: 900, color: 'white', fontSize: '0.9em', letterSpacing: 1 }}>🃏 CAPSA · {gameState.cardMode} kartu</span>
        <span style={{ color: isMyTurn ? '#4ade80' : 'rgba(255,255,255,0.35)', fontWeight: 700, fontSize: '0.75em' }}>
          {isMyTurn ? '▶ Giliran kamu' : `⏳ ${playerLabel(gameState.currentPlayer, myIndex, playerNames, gameState.aiSlots)}`}
        </span>
      </div>

      <div style={{ maxWidth: 620, margin: '0 auto', padding: '10px 12px' }}>

        {(msg || aiMsg) && (
          <div style={{ textAlign: 'center', padding: '7px 14px', marginBottom: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 10, color: (msg || aiMsg).startsWith('❌') || (msg || aiMsg).startsWith('⚠️') ? '#f87171' : '#a3e635', fontWeight: 700, fontSize: '0.8em', animation: 'slideUp .2s ease' }}>
            {msg || aiMsg}
          </div>
        )}

        {/* Other players */}
        <div style={{ display: 'flex', gap: 7, marginBottom: 9 }}>
          {others.map(idx => {
            const hand = gameState.hands[idx]
            const isTheirTurn = gameState.currentPlayer === idx
            return (
              <div key={idx} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '9px 11px', border: `1.5px solid ${isTheirTurn ? 'rgba(74,222,128,.3)' : 'rgba(255,255,255,0.05)'}`, transition: 'border .3s' }}>
                <p style={{ margin: '0 0 7px', color: 'rgba(255,255,255,0.45)', fontSize: '0.72em', fontWeight: 800 }}>
                  {playerLabel(idx, myIndex, playerNames, gameState.aiSlots)} — <span style={{ color: hand.length <= 4 ? '#fbbf24' : 'inherit' }}>{hand.length} kartu</span>
                  {isTheirTurn && <span style={{ color: '#4ade80', marginLeft: 4 }}>▶</span>}
                </p>
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  {hand.map((_, i) => <CardUI key={i} card={makeCard('A', '♠')} faceDown small />)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Table */}
        <div style={{ background: 'rgba(0,0,0,0.28)', borderRadius: 16, padding: '13px 16px', marginBottom: 9, border: '1px solid rgba(255,255,255,0.06)', minHeight: 96, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {gameState.lastCombo ? (
            <>
              <p style={{ margin: '0 0 8px', color: 'rgba(255,255,255,0.28)', fontSize: '0.68em', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>
                {playerLabel(gameState.lastPlayer!, myIndex, playerNames, gameState.aiSlots)} — {comboLabel(gameState.lastCombo.type)}
              </p>
              <div style={{ display: 'flex', gap: 5 }}>
                {gameState.lastCombo.cards.map((c, i) => <CardUI key={i} card={c} />)}
              </div>
            </>
          ) : (
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.16)', fontSize: '0.8em', fontWeight: 700 }}>
              {isMyTurn ? '✨ Meja kosong — bebas main apa aja' : '⏳ Menunggu...'}
            </p>
          )}
        </div>

        {/* My hand */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '12px 13px', border: `1.5px solid ${isMyTurn ? 'rgba(74,222,128,.32)' : 'rgba(255,255,255,0.05)'}`, animation: isMyTurn ? 'glow 2s infinite' : 'none', transition: 'border .3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.78em', fontWeight: 800 }}>
              👤 {playerNames[myIndex] || 'Kamu'} — <span style={{ color: myHand.length <= 4 ? '#fbbf24' : 'inherit' }}>{myHand.length} kartu</span>
              {isMyTurn && <span style={{ color: '#4ade80', marginLeft: 5 }}>▶ GILIRAN</span>}
            </p>
            {selected.length > 0 && <button onClick={() => setSelected([])} style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.22)', color: '#f87171', borderRadius: 7, cursor: 'pointer', fontSize: '0.7em', fontWeight: 700, padding: '3px 8px', fontFamily: 'inherit' }}>✕ Reset</button>}
          </div>

          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', minHeight: 74 }}>
            {myHand.map((card, i) => (
              <div key={`${card.value}${card.suit}`} draggable
                onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; setDragIdx(i) }}
                onDragOver={e => { e.preventDefault(); setDragOverIdx(i) }}
                onDrop={e => {
                  e.preventDefault()
                  if (dragIdx === null || dragIdx === i) { setDragIdx(null); setDragOverIdx(null); return }
                  setHandOrder(prev => {
                    const order = prev.length === myHand.length ? [...prev] : myHand.map((_, idx) => idx)
                    const [moved] = order.splice(dragIdx, 1); order.splice(i, 0, moved); return order
                  })
                  setSelected([]); setDragIdx(null); setDragOverIdx(null)
                }}
                onDragEnd={() => { setDragIdx(null); setDragOverIdx(null) }}
                style={{ opacity: dragIdx === i ? 0.3 : 1, outline: dragOverIdx === i && dragIdx !== i ? '2px dashed #4ade80' : 'none', borderRadius: 9, transition: 'opacity .1s', cursor: 'grab' }}>
                <CardUI card={card} selected={selected.includes(i)} disabled={!isMyTurn} onClick={() => toggleCard(i)} />
              </div>
            ))}
          </div>

          {selected.length > 0 && <ComboPreview cards={selectedCards} />}

          {isMyTurn && (
            <div style={{ display: 'flex', gap: 7, marginTop: 11 }}>
              <button onClick={playCards} disabled={!isPlayable || !selected.length} style={{
                flex: 2, padding: '11px', borderRadius: 12,
                background: isPlayable && selected.length ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'rgba(255,255,255,0.04)',
                color: isPlayable && selected.length ? 'white' : 'rgba(255,255,255,0.18)',
                border: 'none', fontWeight: 900, cursor: isPlayable && selected.length ? 'pointer' : 'not-allowed',
                fontSize: '0.88em', fontFamily: 'inherit',
                boxShadow: isPlayable && selected.length ? '0 4px 14px rgba(22,163,74,.3)' : 'none',
                transition: 'all .15s',
              }}>
                ▶ Main {selected.length > 0 ? `(${selected.length} kartu)` : ''}
              </button>
              {canPass && (
                <button onClick={pass} style={{ flex: 1, padding: '11px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 800, cursor: 'pointer', fontSize: '0.88em', fontFamily: 'inherit', transition: 'all .15s' }}>
                  Pass
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Game Over */}
      {gameState.winner !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, backdropFilter: 'blur(6px)' }}>
          <div style={{ background: '#0d1f10', borderRadius: 28, padding: '40px 32px', maxWidth: 320, width: '90%', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 64px rgba(0,0,0,0.8)', animation: 'slideUp .3s ease' }}>
            <div style={{ fontSize: '4em', marginBottom: 12 }}>{gameState.winner === myIndex ? '🏆' : '😢'}</div>
            <h2 style={{ fontWeight: 900, color: 'white', margin: '0 0 8px', fontSize: '1.4em' }}>
              {gameState.winner === myIndex ? 'Kamu Menang! 🎉' : `${playerLabel(gameState.winner, myIndex, playerNames, gameState.aiSlots)} Menang!`}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', margin: '0 0 24px', fontSize: '0.85em' }}>
              {gameState.winner === myIndex ? 'Kartu habis duluan!' : 'Coba lagi!'}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={resetGame} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(22,163,74,.3)' }}>
                🔄 Main Lagi
              </button>
              <Link href="/games" style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
                🎮 Games
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}