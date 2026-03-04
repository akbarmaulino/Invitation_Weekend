'use client'
import { useState, useEffect } from 'react'

const T = {
  navy: '#03254c', navyMid: '#1a4d7a',
  sky: '#c4e8ff', skyLight: '#e1f3ff', skyMid: '#a8d8f0',
  white: '#ffffff', muted: '#6b8cae',
}

export default function Countdown({ tripDate }: { tripDate: string }) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, passed: false })

  useEffect(() => {
    function calc() {
      const diff = new Date(tripDate + 'T00:00:00').getTime() - Date.now()
      if (diff <= 0) { setTime({ days:0, hours:0, minutes:0, seconds:0, passed:true }); return }
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        passed: false,
      })
    }
    calc()
    const t = setInterval(calc, 1000)
    return () => clearInterval(t)
  }, [tripDate])

  if (time.passed) return (
    <div style={{
      padding: '11px 18px', borderRadius: 12,
      background: T.white, border: `1.5px solid ${T.sky}`,
      fontWeight: 700, color: T.navy, fontSize: '0.88em',
      textAlign: 'center',
      boxShadow: '0 1px 8px rgba(3,37,76,.07)',
    }}>
      🎉 Trip sudah dimulai! Selamat bersenang-senang!
    </div>
  )

  const Num = ({ v, l }: { v: number; l: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{
        minWidth: 46, height: 46, borderRadius: 11,
        background: `linear-gradient(135deg, ${T.navy}, ${T.navyMid})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.2em', fontWeight: 800, color: T.white,
        boxShadow: '0 3px 10px rgba(3,37,76,.22)',
        letterSpacing: -0.5,
      }}>{String(v).padStart(2, '0')}</div>
      <span style={{ fontSize: '0.6em', color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>{l}</span>
    </div>
  )

  return (
    <div style={{
      padding: '12px 16px', borderRadius: 14,
      background: T.white,
      border: `1.5px solid ${T.sky}`,
      boxShadow: '0 1px 10px rgba(3,37,76,.07)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 10,
    }}>
      <span style={{ fontSize: '0.8em', fontWeight: 700, color: T.muted, whiteSpace: 'nowrap' }}>
        ✨ Hitung mundur trip
        {time.days <= 7 && <span style={{ color: T.navy, marginLeft: 6 }}>— {time.days === 0 ? 'Hari ini!' : `${time.days} hari lagi!`}</span>}
      </span>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Num v={time.days} l='Hari' />
        <span style={{ color: T.skyMid, fontWeight: 800, fontSize: '1.1em', marginBottom: 16 }}>:</span>
        <Num v={time.hours} l='Jam' />
        <span style={{ color: T.skyMid, fontWeight: 800, fontSize: '1.1em', marginBottom: 16 }}>:</span>
        <Num v={time.minutes} l='Menit' />
        <span style={{ color: T.skyMid, fontWeight: 800, fontSize: '1.1em', marginBottom: 16 }}>:</span>
        <Num v={time.seconds} l='Detik' />
      </div>
    </div>
  )
}