'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface ChatMessage { id: string; sender: string; text: string; ts: number }
interface Reaction { id: string; emoji: string; x: number; y: number; ts: number }

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const REACTIONS = ['❤️','😂','😱','😭','🔥','👏','😍','💀']

const TURN_USER = process.env.NEXT_PUBLIC_TURN_USERNAME || '52361553299cc352d159aa8a'
const TURN_CRED = process.env.NEXT_PUBLIC_TURN_CREDENTIAL || 'UqT3j4VoaECWj4on'
const TURN_DOMAIN = process.env.NEXT_PUBLIC_TURN_DOMAIN || 'global.relay.metered.ca'

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: `stun:${TURN_DOMAIN}:80` },
  { urls: `turn:${TURN_DOMAIN}:80`, username: TURN_USER, credential: TURN_CRED },
  { urls: `turns:${TURN_DOMAIN}:443?transport=tcp`, username: TURN_USER, credential: TURN_CRED },
]

const GOLD = '#c9a96e'
const CREAM = '#fdf6e3'
const DARK = '#0d1b2a'

// ── UTILS ─────────────────────────────────────────────────────────────────────
function genCode() { return Math.random().toString(36).slice(2, 8).toUpperCase() }
function genId() { return Math.random().toString(36).slice(2) }
function fmtTime(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60)
  return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${m}:${String(sec).padStart(2,'0')}`
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
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
  const [needsInteraction, setNeedsInteraction] = useState(false)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [screenActive, setScreenActive] = useState(false)

  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const playStartRef = useRef<number>(0)

  // ── SUPABASE REALTIME ────────────────────────────────────────────────────────
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
        await ch.track({ name: myName, host: isHost, onlineAt: new Date().toISOString() })
      }
    })

    return () => { supabase.removeChannel(ch) }
  }, [roomCode, phase])

  // ── TIMER LOGIC ──────────────────────────────────────────────────────────────
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

  // ── WEBRTC SIGNALING ─────────────────────────────────────────────────────────
  async function broadcastWebRTC(payload: any) {
    await supabase.channel(`watch:${roomCode}`).send({
      type: 'broadcast',
      event: 'webrtc',
      payload
    })
  }

  async function handleWebRTCSignal(payload: any) {
    if (isHost) {
      if (payload.type === 'answer' && pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp))
      } else if (payload.type === 'candidate' && pcRef.current) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(() => {})
      }
    } else {
      if (payload.type === 'offer') {
        if (pcRef.current) pcRef.current.close()
        
        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
        pcRef.current = pc

        pc.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
          if (e.candidate) broadcastWebRTC({ type: 'candidate', candidate: e.candidate })
        }

        pc.ontrack = (e: RTCTrackEvent) => {
          if (e.streams[0]) {
            streamRef.current = e.streams[0]
            setShowScreen(true)
            setNeedsInteraction(true)
            
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.srcObject = e.streams[0]
                videoRef.current.muted = true
                videoRef.current.play().catch(err => console.error(err))
              }
            }, 200)
          }
        }

        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp))
        if (payload.candidates) {
          payload.candidates.forEach((c: any) => {
            pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {})
          })
        }

        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        broadcastWebRTC({ type: 'answer', sdp: pc.localDescription })
      } else if (payload.type === 'candidate' && pcRef.current) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(() => {})
      }
    }
  }

  async function startScreenShare() {
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true, audio: true })
      streamRef.current = stream
      stream.getVideoTracks()[0].onended = () => stopScreenShare()

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setShowScreen(true)
      }

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
      pcRef.current = pc
      
      // PERBAIKAN: Memberikan tipe data 'MediaStreamTrack' pada 't'
      stream.getTracks().forEach((t: MediaStreamTrack) => pc.addTrack(t, stream))

      const collectedCandidates: RTCIceCandidate[] = []
      pc.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
        if (e.candidate) {
          collectedCandidates.push(e.candidate)
          broadcastWebRTC({ type: 'candidate', candidate: e.candidate })
        }
      }

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      broadcastWebRTC({ type: 'offer', sdp: pc.localDescription, candidates: collectedCandidates })
      setScreenActive(true)
    } catch (e) {
      console.error(e)
    }
  }

  function stopScreenShare() {
    streamRef.current?.getTracks().forEach((t: MediaStreamTrack) => t.stop())
    pcRef.current?.close()
    pcRef.current = null
    streamRef.current = null
    setShowScreen(false)
    setScreenActive(false)
  }

  // ── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: DARK, color: CREAM, fontFamily: 'serif' }}>
      {phase === 'lobby' && (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ width: '100%', maxWidth: 400, background: '#162435', padding: 40, borderRadius: 24, border: `1px solid ${GOLD}33` }}>
            <h1 style={{ color: GOLD, textAlign: 'center', marginBottom: 30 }}>Watch Party</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <input placeholder="Nama Kamu" value={myName} onChange={e => setMyName(e.target.value)} style={inputStyle} />
              <input placeholder="Judul Film" value={filmTitle} onChange={e => setFilmTitle(e.target.value)} style={inputStyle} />
              <button onClick={() => { if(myName && filmTitle) { setRoomCode(genCode()); setIsHost(true); setPhase('waiting'); } }} style={btnStyle}>Buat Room</button>
              <input placeholder="Kode Room" value={joinCode} onChange={e => setJoinCode(e.target.value)} style={inputStyle} />
              <button onClick={() => { if(myName && joinCode) { setRoomCode(joinCode.toUpperCase()); setIsHost(false); setPhase('party'); } }} style={{ ...btnStyle, background: 'transparent', border: `1px solid ${GOLD}`, color: GOLD }}>Join Party</button>
            </div>
          </div>
        </div>
      )}

      {phase === 'waiting' && (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30 }}>
          <h1 style={{ fontSize: '3rem', color: GOLD }}>{roomCode}</h1>
          <p>{partnerOnline ? 'Pasangan Ready!' : 'Menunggu Partner...'}</p>
          <button disabled={!partnerOnline} onClick={() => setPhase('party')} style={btnStyle}>Mulai</button>
        </div>
      )}

      {phase === 'party' && (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, position: 'relative', background: '#000' }}>
            {showScreen && (
              <>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                {needsInteraction && (
                  <div onClick={() => { if(videoRef.current){videoRef.current.muted=false; videoRef.current.play();} setNeedsInteraction(false); }} style={overlayStyle}>
                    <div style={tapStyle}>TAP UNTUK SUARA 🔊</div>
                  </div>
                )}
              </>
            )}
            {reactions.map(r => (
              <div key={r.id} style={{ position: 'absolute', left: `${r.x}%`, top: `${r.y}%`, fontSize: '3rem', animation: 'reactionFloat 3s forwards' }}>{r.emoji}</div>
            ))}
          </div>

          <div style={{ padding: 20, background: '#0a1524', display: 'flex', gap: 15, alignItems: 'center' }}>
            <span style={{ color: GOLD, fontSize: '1.2rem' }}>{fmtTime(elapsed)}</span>
            <button onClick={() => {
               const next = !isPlaying; setIsPlaying(next);
               supabase.channel(`watch:${roomCode}`).send({ type: 'broadcast', event: 'sync', payload: { playing: next, time: elapsed, ts: Date.now() } })
            }} style={{ width: 40, height: 40, borderRadius: '50%', background: GOLD }}>{isPlaying ? '⏸' : '▶'}</button>
            {isHost && <button onClick={screenActive ? stopScreenShare : startScreenShare} style={{ color: GOLD }}>{screenActive ? 'Stop' : 'Share'}</button>}
            <div style={{ marginLeft: 'auto' }}>
              {REACTIONS.slice(0,4).map(e => <button key={e} onClick={() => {
                const r = { id: genId(), emoji: e, x: 20 + Math.random() * 60, y: 20 + Math.random() * 60, ts: Date.now() };
                setReactions(p => [...p, r]); setTimeout(() => setReactions(p => p.filter(x => x.id !== r.id)), 3000);
                supabase.channel(`watch:${roomCode}`).send({ type: 'broadcast', event: 'reaction', payload: r })
              }} style={{ fontSize: '1.5rem' }}>{e}</button>)}
            </div>
          </div>

          <div style={{ height: 150, background: '#0d1b2a', padding: 10, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {messages.map(m => <div key={m.id}><b style={{ color: GOLD }}>{m.sender}:</b> {m.text}</div>)}
              <div ref={chatEndRef} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if(e.key==='Enter' && chatInput.trim()){
                const msg = { id: genId(), sender: myName, text: chatInput, ts: Date.now() };
                setMessages(p => [...p, msg]); setChatInput('');
                supabase.channel(`watch:${roomCode}`).send({ type: 'broadcast', event: 'chat', payload: msg })
              }}} style={{ flex: 1, background: '#1a2a3a', color: '#fff' }} />
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes reactionFloat { 0%{opacity:1; transform:translateY(0);} 100%{opacity:0; transform:translateY(-100px);} }`}</style>
    </div>
  )
}

const inputStyle = { padding: 12, borderRadius: 8, background: '#0d1b2a', border: '1px solid #333', color: '#fff' }
const btnStyle = { padding: 12, borderRadius: 8, background: GOLD, color: DARK, fontWeight: 'bold' }
const overlayStyle: any = { position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }
const tapStyle = { background: GOLD, color: DARK, padding: '15px 30px', borderRadius: 99, fontWeight: 'bold' }