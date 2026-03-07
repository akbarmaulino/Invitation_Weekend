'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface ChatMessage { id: string; sender: string; text: string; ts: number }
interface Reaction { id: string; emoji: string; x: number; y: number; ts: number }
interface RoomState {
  room_code: string
  host_name: string
  partner_name: string | null
  film_title: string
  is_playing: boolean
  current_time: number
  updated_at: number
}

const REACTIONS = ['❤️','😂','😱','😭','🔥','👏','😍','💀']

const TURN_USER = process.env.NEXT_PUBLIC_TURN_USERNAME || '52361553299cc352d159aa8a'
const TURN_CRED = process.env.NEXT_PUBLIC_TURN_CREDENTIAL || 'UqT3j4VoaECWj4on'
const TURN_DOMAIN = process.env.NEXT_PUBLIC_TURN_DOMAIN || 'global.relay.metered.ca'
const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: `stun:${TURN_DOMAIN}:80` },
  ...(TURN_USER ? [
    { urls: `turn:${TURN_DOMAIN}:80`,                        username: TURN_USER, credential: TURN_CRED },
    { urls: `turn:${TURN_DOMAIN}:80?transport=tcp`,          username: TURN_USER, credential: TURN_CRED },
    { urls: `turn:${TURN_DOMAIN}:443`,                       username: TURN_USER, credential: TURN_CRED },
    { urls: `turns:${TURN_DOMAIN}:443?transport=tcp`,        username: TURN_USER, credential: TURN_CRED },
  ] : []),
]

const GOLD = '#c9a96e'
const CREAM = '#fdf6e3'
const DARK = '#0d1b2a'

function genCode() { return Math.random().toString(36).slice(2, 8).toUpperCase() }
function genId() { return Math.random().toString(36).slice(2) }
function fmtTime(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60)
  return h > 0
    ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
    : `${m}:${String(sec).padStart(2,'0')}`
}

export default function WatchPartyPage() {
  const [phase, setPhase] = useState<'lobby' | 'waiting' | 'party'>('lobby')
  const [myName, setMyName] = useState('')
  const [filmTitle, setFilmTitle] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [isHost, setIsHost] = useState(false)
  const [partnerOnline, setPartnerOnline] = useState(false)
  const [error, setError] = useState('')

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [chatInput, setChatInput] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showScreen, setShowScreen] = useState(false)
  const [screenActive, setScreenActive] = useState(false)
  const [needsTap, setNeedsTap] = useState(false)

  // KEY FIX: simpan stream sebagai STATE, bukan hanya ref
  // Ini yang memastikan PartyScreen selalu dapat stream terbaru
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const playStartRef = useRef<number>(0)

  useEffect(() => {
    if (!roomCode || phase === 'lobby') return
    const ch = supabase.channel(`watch:${roomCode}`, { config: { broadcast: { self: false } } })

    ch.on('broadcast', { event: 'chat' }, ({ payload }) => {
      setMessages(m => [...m, payload as ChatMessage])
    })
    ch.on('broadcast', { event: 'reaction' }, ({ payload }) => {
      const r = payload as Reaction
      setReactions(prev => [...prev, r])
      setTimeout(() => setReactions(prev => prev.filter(x => x.id !== r.id)), 3000)
    })
    ch.on('broadcast', { event: 'sync' }, ({ payload }) => {
      const s = payload as { playing: boolean; time: number; ts: number }
      const lag = (Date.now() - s.ts) / 1000
      setElapsed(s.time + lag)
      setIsPlaying(s.playing)
      if (s.playing) {
        playStartRef.current = Date.now() - (s.time + lag) * 1000
      }
    })
    ch.on('broadcast', { event: 'webrtc' }, ({ payload }) => {
      handleWebRTCSignal(payload)
    })
    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState()
      setPartnerOnline(Object.keys(state).length >= 2)
    })

    ch.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await ch.track({ name: myName, host: isHost })
      }
    })

    return () => { supabase.removeChannel(ch) }
  }, [roomCode, phase])

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (isPlaying) {
      playStartRef.current = Date.now() - elapsed * 1000
      timerRef.current = setInterval(() => {
        setElapsed((Date.now() - playStartRef.current) / 1000)
      }, 250)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isPlaying])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function startScreenShare() {
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { frameRate: { ideal: 30 } },
        audio: { echoCancellation: false, noiseSuppression: false, sampleRate: 44100 }
      })
      localStreamRef.current = stream
      stream.getVideoTracks()[0].onended = () => stopScreenShare()

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setShowScreen(true)
      }

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
      pcRef.current = pc
      stream.getTracks().forEach((t: MediaStreamTrack) => pc.addTrack(t, stream))

      const candidates: RTCIceCandidate[] = []
      pc.onicecandidate = e => { if (e.candidate) candidates.push(e.candidate) }

      await new Promise<void>(resolve => {
        pc.onicegatheringstatechange = () => {
          if (pc.iceGatheringState === 'complete') resolve()
        }
        setTimeout(resolve, 3000)
      })

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      await new Promise(r => setTimeout(r, 800))
      broadcastWebRTC({ type: 'offer', sdp: pc.localDescription, candidates })
      setScreenActive(true)
    } catch (e) {
      console.error('[WP] Screen share failed:', e)
      setShowScreen(false)
    }
  }

  function stopScreenShare() {
    localStreamRef.current?.getTracks().forEach(t => t.stop())
    pcRef.current?.close()
    pcRef.current = null
    localStreamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setScreenActive(false)
    setShowScreen(false)
  }

  async function handleWebRTCSignal(payload: any) {
    if (isHost) {
      if (payload.type === 'answer' && pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp))
      }
    } else {
      if (payload.type === 'offer') {
        if (pcRef.current) pcRef.current.close()

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
        pcRef.current = pc

        pc.onicecandidate = e => {
          if (e.candidate) broadcastWebRTC({ type: 'candidate', candidate: e.candidate })
        }

        pc.ontrack = e => {
          console.log('[WP] ontrack fired, streams:', e.streams.length)
          if (e.streams[0]) {
            // KEY FIX: simpan ke STATE bukan hanya ref
            setRemoteStream(e.streams[0])
            setShowScreen(true)
            setNeedsTap(true)
          }
        }

        pc.onconnectionstatechange = () => console.log('[WP] conn:', pc.connectionState)
        pc.oniceconnectionstatechange = () => console.log('[WP] ice:', pc.iceConnectionState)

        await new Promise(r => setTimeout(r, 200))
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp))

        if (payload.candidates) {
          for (const c of payload.candidates) {
            await pc.addIceCandidate(new RTCIceCandidate(c))
              .catch(e => console.warn('[WP] ICE add failed:', e))
          }
        }

        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        broadcastWebRTC({ type: 'answer', sdp: pc.localDescription })
      }
    }
  }

  function broadcastWebRTC(payload: any) {
    supabase.channel(`watch:${roomCode}`).send({ type: 'broadcast', event: 'webrtc', payload })
  }

  async function createRoom() {
    if (!myName.trim() || !filmTitle.trim()) { setError('Isi nama dan judul film dulu!'); return }
    const code = genCode()
    setRoomCode(code)
    setIsHost(true)
    setPhase('waiting')
    setError('')
  }

  async function joinRoom() {
    if (!myName.trim() || !joinCode.trim()) { setError('Isi nama dan kode room dulu!'); return }
    setRoomCode(joinCode.toUpperCase())
    setIsHost(false)
    setPhase('party')
    setError('')
  }

  function startParty() { setPhase('party') }

  function togglePlay() {
    const next = !isPlaying
    setIsPlaying(next)
    supabase.channel(`watch:${roomCode}`).send({
      type: 'broadcast', event: 'sync',
      payload: { playing: next, time: elapsed, ts: Date.now() }
    })
  }

  function sendChat() {
    if (!chatInput.trim()) return
    const msg: ChatMessage = { id: genId(), sender: myName, text: chatInput.trim(), ts: Date.now() }
    setMessages(m => [...m, msg])
    supabase.channel(`watch:${roomCode}`).send({ type: 'broadcast', event: 'chat', payload: msg })
    setChatInput('')
  }

  function sendReaction(emoji: string) {
    const r: Reaction = {
      id: genId(), emoji,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      ts: Date.now()
    }
    setReactions(prev => [...prev, r])
    setTimeout(() => setReactions(prev => prev.filter(x => x.id !== r.id)), 3000)
    supabase.channel(`watch:${roomCode}`).send({ type: 'broadcast', event: 'reaction', payload: r })
  }

  return (
    <div style={{ minHeight: '100vh', background: DARK, fontFamily: "'Georgia', serif", position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")', opacity: 0.08, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '60vw', height: '40vh', background: `radial-gradient(ellipse, rgba(201,169,110,0.08) 0%, transparent 70%)`, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {phase === 'lobby' && (
          <LobbyScreen
            myName={myName} setMyName={setMyName}
            filmTitle={filmTitle} setFilmTitle={setFilmTitle}
            joinCode={joinCode} setJoinCode={setJoinCode}
            onCreate={createRoom} onJoin={joinRoom} error={error}
          />
        )}
        {phase === 'waiting' && (
          <WaitingScreen
            roomCode={roomCode} filmTitle={filmTitle}
            myName={myName} partnerOnline={partnerOnline} onStart={startParty}
          />
        )}
        {phase === 'party' && (
          <PartyScreen
            myName={myName} filmTitle={filmTitle} isHost={isHost} roomCode={roomCode}
            messages={messages} reactions={reactions}
            chatInput={chatInput} setChatInput={setChatInput}
            onSendChat={sendChat} onReaction={sendReaction}
            elapsed={elapsed} isPlaying={isPlaying} onTogglePlay={togglePlay}
            partnerOnline={partnerOnline} screenActive={screenActive}
            onStartScreen={startScreenShare} onStopScreen={stopScreenShare}
            showScreen={showScreen} videoRef={videoRef}
            remoteStream={remoteStream}   // <-- pass sebagai STATE bukan ref
            chatEndRef={chatEndRef}
            needsTap={needsTap} setNeedsTap={setNeedsTap}
          />
        )}
      </div>
    </div>
  )
}

function LobbyScreen({ myName, setMyName, filmTitle, setFilmTitle, joinCode, setJoinCode, onCreate, onJoin, error }: any) {
  const [tab, setTab] = useState<'create' | 'join'>('create')
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: '3em', marginBottom: 8 }}>🎬</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8em, 5vw, 2.8em)', color: CREAM, margin: '0 0 8px', fontWeight: 400, letterSpacing: '-0.5px' }}>
          Watch Together
        </h1>
        <p style={{ color: GOLD, fontSize: '0.9em', margin: 0, fontStyle: 'italic', opacity: 0.8 }}>Nonton bareng, walau berjauhan</p>
      </div>
      <div style={{ width: '100%', maxWidth: 420, background: 'rgba(255,255,255,0.04)', borderRadius: 20, border: '1px solid rgba(201,169,110,0.2)', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(201,169,110,0.15)' }}>
          {(['create', 'join'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '14px', background: 'none', border: 'none', color: tab === t ? GOLD : 'rgba(255,255,255,0.4)', fontWeight: tab === t ? 700 : 400, fontSize: '0.85em', cursor: 'pointer', borderBottom: tab === t ? `2px solid ${GOLD}` : '2px solid transparent', transition: 'all .2s', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {t === 'create' ? '🎥 Buat Room' : '🔗 Join Room'}
            </button>
          ))}
        </div>
        <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Nama kamu" value={myName} onChange={setMyName} placeholder="e.g. Rara" />
          {tab === 'create'
            ? <Input label="Judul film / tontonan" value={filmTitle} onChange={setFilmTitle} placeholder="e.g. Your Name" />
            : <Input label="Kode room" value={joinCode} onChange={(v: string) => setJoinCode(v.toUpperCase())} placeholder="e.g. AB12CD" mono />
          }
          {error && <p style={{ color: '#ff6b6b', fontSize: '0.78em', margin: 0, textAlign: 'center' }}>{error}</p>}
          <button
            onClick={tab === 'create' ? onCreate : onJoin}
            style={{ padding: '14px', background: `linear-gradient(135deg, ${GOLD} 0%, #a07840 100%)`, border: 'none', borderRadius: 12, color: DARK, fontWeight: 800, fontSize: '0.95em', cursor: 'pointer', letterSpacing: '0.05em', boxShadow: '0 4px 20px rgba(201,169,110,0.3)', transition: 'transform .15s, box-shadow .15s' }}
            onMouseEnter={e => { (e.target as any).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.target as any).style.transform = '' }}>
            {tab === 'create' ? 'Buat Room →' : 'Join Room →'}
          </button>
        </div>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7em', marginTop: 24, textAlign: 'center', maxWidth: 320, lineHeight: 1.6 }}>
        Sync timer + live chat + screen share (YouTube & file lokal). Netflix tidak support screen capture.
      </p>
    </div>
  )
}

function WaitingScreen({ roomCode, filmTitle, partnerOnline, onStart }: any) {
  const [copied, setCopied] = useState(false)
  function copyCode() {
    navigator.clipboard.writeText(roomCode)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: '2.5em', marginBottom: 16 }}>🎞️</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", color: CREAM, fontSize: 'clamp(1.3em, 4vw, 1.8em)', margin: '0 0 6px', fontWeight: 400 }}>Menunggu pasangan...</h2>
      <p style={{ color: GOLD, fontStyle: 'italic', margin: '0 0 36px', fontSize: '0.9em', opacity: 0.8 }}>{filmTitle}</p>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,169,110,0.25)', borderRadius: 16, padding: '24px 32px', marginBottom: 32, width: '100%', maxWidth: 360 }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72em', margin: '0 0 10px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Kode Room</p>
        <div style={{ fontFamily: 'monospace', fontSize: 'clamp(2em, 8vw, 3em)', fontWeight: 900, color: GOLD, letterSpacing: '0.15em', marginBottom: 16 }}>{roomCode}</div>
        <button onClick={copyCode} style={{ padding: '8px 20px', background: copied ? 'rgba(201,169,110,0.2)' : 'transparent', border: `1px solid ${GOLD}`, borderRadius: 99, color: GOLD, fontSize: '0.78em', cursor: 'pointer', transition: 'all .2s' }}>
          {copied ? '✓ Tersalin!' : 'Salin kode'}
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: partnerOnline ? '#4ade80' : '#6b7280', boxShadow: partnerOnline ? '0 0 8px #4ade80' : 'none', transition: 'all .3s' }} />
        <span style={{ color: partnerOnline ? '#4ade80' : 'rgba(255,255,255,0.4)', fontSize: '0.82em' }}>
          {partnerOnline ? 'Pasangan sudah join!' : 'Belum ada yang join...'}
        </span>
      </div>
      <button onClick={onStart} disabled={!partnerOnline}
        style={{ padding: '14px 36px', background: partnerOnline ? `linear-gradient(135deg, ${GOLD}, #a07840)` : 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 12, color: partnerOnline ? DARK : 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '1em', cursor: partnerOnline ? 'pointer' : 'not-allowed', transition: 'all .3s' }}>
        Mulai Nonton 🎬
      </button>
    </div>
  )
}

// KEY FIX: PartyScreen terima remoteStream sebagai prop STATE biasa
function PartyScreen({ myName, filmTitle, isHost, roomCode, messages, reactions, chatInput, setChatInput, onSendChat, onReaction, elapsed, isPlaying, onTogglePlay, partnerOnline, screenActive, onStartScreen, onStopScreen, showScreen, videoRef, remoteStream, chatEndRef, needsTap, setNeedsTap }: any) {
  const [showReactions, setShowReactions] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [chatOpen, setChatOpen] = useState(true)
  // Ref video lokal di komponen ini
  const localVidRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Saat remoteStream berubah (ada stream baru), simpan ke localVidRef
  // Tapi JANGAN langsung play — tunggu tap dari user (mobile policy)
  useEffect(() => {
    if (remoteStream && localVidRef.current) {
      localVidRef.current.srcObject = remoteStream
      console.log('[WP] srcObject di-set dari useEffect, stream tracks:', remoteStream.getTracks().length)
    }
  }, [remoteStream])

  function assignVideoRef(el: HTMLVideoElement | null) {
    localVidRef.current = el
    if (videoRef) videoRef.current = el
    // Kalau stream sudah ada dan el baru mount, langsung set srcObject
    if (el && remoteStream) {
      el.srcObject = remoteStream
    }
  }

  function handleTap() {
    const vid = localVidRef.current
    console.log('[TAP] vid:', !!vid, 'srcObject:', !!(vid?.srcObject), 'remoteStream:', !!remoteStream)

    if (!vid) { console.error('[TAP] No video element'); return }

    // Pastikan srcObject sudah di-set
    if (!vid.srcObject && remoteStream) {
      vid.srcObject = remoteStream
    }

    if (!vid.srcObject) { console.error('[TAP] No srcObject even after assign'); return }

    // Muted play dulu — WAJIB di mobile
    vid.muted = true
    vid.play()
      .then(() => {
        console.log('[TAP] ✅ Play sukses!')
        // Setelah play berjalan, coba unmute
        setTimeout(() => {
          vid.muted = false
          setNeedsTap(false)
        }, 500)
      })
      .catch((err: unknown) => {
        console.error('[TAP] Play gagal:', err)
        // Tetap sembunyikan overlay meski muted, agar user bisa lihat video
        setNeedsTap(false)
      })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(201,169,110,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1.2em' }}>🎬</span>
          <div>
            <p style={{ margin: 0, color: CREAM, fontWeight: 700, fontSize: '0.9em', fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>{filmTitle}</p>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.35)', fontSize: '0.68em', letterSpacing: '0.05em' }}>ROOM: {roomCode} · {myName}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: 99, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: partnerOnline ? '#4ade80' : '#6b7280', boxShadow: partnerOnline ? '0 0 6px #4ade80' : 'none' }} />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7em' }}>{partnerOnline ? 'Online' : 'Offline'}</span>
          </div>
          {isMobile && (
            <button onClick={() => setChatOpen(o => !o)} style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 99, color: 'rgba(255,255,255,0.6)', fontSize: '0.72em', cursor: 'pointer' }}>
              {chatOpen ? 'Sembunyikan chat' : '💬 Chat'}
            </button>
          )}
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>

          {/* Screen area */}
          <div style={{ flex: 1, position: 'relative', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: isMobile ? 220 : 0 }}>
            {showScreen ? (
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <video
                  ref={assignVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
                {needsTap && (
                  <div
                    onClick={handleTap}
                    style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.6)', zIndex: 10 }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD}, #a07840)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 40px rgba(201,169,110,0.6)', fontSize: '2em' }}>▶</div>
                      <p style={{ color: 'white', fontWeight: 700, fontSize: '1.1em', margin: 0 }}>Tap untuk mulai</p>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75em', margin: '6px 0 0' }}>Ketuk layar untuk memutar video</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <div style={{ fontSize: isMobile ? '3em' : '5em', marginBottom: 12, opacity: 0.3 }}>🎞️</div>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.82em', lineHeight: 1.6, maxWidth: 280, margin: '0 auto' }}>
                  {isHost ? 'Mulai screen share di bawah untuk streaming ke pasangan' : 'Menunggu host mulai screen share...'}
                </p>
              </div>
            )}

            {reactions.map((r: Reaction) => (
              <div key={r.id} style={{ position: 'absolute', left: `${r.x}%`, top: `${r.y}%`, fontSize: isMobile ? '1.8em' : '2.4em', animation: 'reactionFloat 3s ease forwards', pointerEvents: 'none', zIndex: 10 }}>
                {r.emoji}
              </div>
            ))}
          </div>

          {/* Controls */}
          <div style={{ padding: isMobile ? '10px 12px' : '14px 20px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 14, flexWrap: 'wrap' }}>
            <div style={{ fontFamily: 'monospace', fontSize: isMobile ? '1em' : '1.2em', color: GOLD, fontWeight: 700, minWidth: 60 }}>{fmtTime(elapsed)}</div>

            <button
              onClick={() => {
                onTogglePlay()
                if (needsTap) handleTap()
              }}
              style={{ width: isMobile ? 38 : 44, height: isMobile ? 38 : 44, borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD}, #a07840)`, border: 'none', color: DARK, fontSize: isMobile ? '1em' : '1.2em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(201,169,110,0.35)', flexShrink: 0 }}>
              {isPlaying ? '⏸' : '▶'}
            </button>

            {isHost && (
              <button
                onClick={screenActive ? onStopScreen : onStartScreen}
                style={{ padding: isMobile ? '6px 12px' : '7px 16px', background: screenActive ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.07)', border: `1px solid ${screenActive ? '#ef4444' : 'rgba(255,255,255,0.15)'}`, borderRadius: 8, color: screenActive ? '#ef4444' : 'rgba(255,255,255,0.7)', fontSize: '0.75em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
                {screenActive ? '⏹ Stop Share' : '🖥️ Share Screen'}
              </button>
            )}

            <div style={{ marginLeft: 'auto', position: 'relative' }}>
              <button onClick={() => setShowReactions(r => !r)}
                style={{ padding: isMobile ? '6px 10px' : '7px 14px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(255,255,255,0.8)', fontSize: isMobile ? '0.9em' : '1em', cursor: 'pointer' }}>
                😊
              </button>
              {showReactions && (
                <div style={{ position: 'absolute', bottom: '110%', right: 0, background: 'rgba(20,30,45,0.95)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 14, padding: '10px 12px', display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: isMobile ? 180 : 240, backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                  {REACTIONS.map(e => (
                    <button key={e} onClick={() => { onReaction(e); setShowReactions(false) }}
                      style={{ background: 'none', border: 'none', fontSize: isMobile ? '1.4em' : '1.6em', cursor: 'pointer', padding: '2px', borderRadius: 6, transition: 'transform .15s' }}
                      onMouseEnter={ev => (ev.currentTarget.style.transform = 'scale(1.3)')}
                      onMouseLeave={ev => (ev.currentTarget.style.transform = '')}>
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat */}
        {(!isMobile || chatOpen) && (
          <div style={{ width: isMobile ? '100%' : 300, height: isMobile ? 280 : 'auto', background: 'rgba(255,255,255,0.03)', borderLeft: isMobile ? 'none' : '1px solid rgba(255,255,255,0.07)', borderTop: isMobile ? '1px solid rgba(255,255,255,0.07)' : 'none', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.7em', letterSpacing: '0.1em', textTransform: 'uppercase' }}>💬 Live Chat</p>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {messages.length === 0 && (
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.78em', textAlign: 'center', fontStyle: 'italic', marginTop: 20 }}>Belum ada chat. Mulai ngobrol!</p>
              )}
              {messages.map((m: ChatMessage) => (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender === myName ? 'flex-end' : 'flex-start' }}>
                  <span style={{ fontSize: '0.62em', color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>{m.sender}</span>
                  <div style={{ background: m.sender === myName ? `rgba(201,169,110,0.2)` : 'rgba(255,255,255,0.07)', border: `1px solid ${m.sender === myName ? 'rgba(201,169,110,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: m.sender === myName ? '12px 12px 2px 12px' : '12px 12px 12px 2px', padding: '7px 11px', maxWidth: '85%' }}>
                    <p style={{ margin: 0, color: m.sender === myName ? GOLD : CREAM, fontSize: '0.82em', lineHeight: 1.4 }}>{m.text}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onSendChat()}
                placeholder="Ketik pesan..."
                style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: CREAM, fontSize: '0.82em', outline: 'none' }}
              />
              <button onClick={onSendChat} style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${GOLD}, #a07840)`, border: 'none', borderRadius: 8, color: DARK, cursor: 'pointer', fontWeight: 900, fontSize: '0.9em', flexShrink: 0 }}>→</button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes reactionFloat {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-80px) scale(1.5); }
        }
      `}</style>
    </div>
  )
}

function Input({ label, value, onChange, placeholder, mono }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72em', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: CREAM, fontSize: mono ? '1.1em' : '0.9em', fontFamily: mono ? 'monospace' : 'inherit', outline: 'none', letterSpacing: mono ? '0.15em' : 'normal', transition: 'border .2s' }}
        onFocus={e => (e.target.style.borderColor = GOLD)}
        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
      />
    </div>
  )
}