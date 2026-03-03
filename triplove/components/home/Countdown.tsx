'use client'
import { useState, useEffect } from 'react'

export default function Countdown({ tripDate }: { tripDate: string }) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, passed: false })
  useEffect(() => {
    function calc() {
      const diff = new Date(tripDate + 'T00:00:00').getTime() - Date.now()
      if (diff <= 0) { setTime({ days:0, hours:0, minutes:0, seconds:0, passed:true }); return }
      setTime({ days: Math.floor(diff/86400000), hours: Math.floor((diff%86400000)/3600000), minutes: Math.floor((diff%3600000)/60000), seconds: Math.floor((diff%60000)/1000), passed: false })
    }
    calc(); const t = setInterval(calc, 1000); return () => clearInterval(t)
  }, [tripDate])

  if (time.passed) return (
    <div style={{ textAlign: 'center', padding: '14px 20px', borderRadius: 20, background: 'linear-gradient(135deg, #c4e8ff, #c4e8ff)', border: '2px solid #a8d8f0', fontWeight: 700, color: '#03254c' }}>
      🎉 Trip sudah dimulai! Selamat bersenang-senang!
    </div>
  )

  const Box = ({ value, label }: { value: number; label: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ width: 56, height: 56, borderRadius: 12, background: 'white', border: '2px solid #c4e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4em', fontWeight: 800, color: '#03254c' }}>{String(value).padStart(2,'0')}</div>
      <span style={{ fontSize: '0.68em', color: '#03254c', fontWeight: 700, textTransform: 'uppercase' }}>{label}</span>
    </div>
  )

  return (
    <div style={{ padding: '16px 20px', borderRadius: 20, background: 'linear-gradient(135deg, #c4e8ff, #c4e8ff)', border: '2px solid #a8d8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <p style={{ margin: 0, fontSize: '0.85em', fontWeight: 700, color: '#03254c' }}>✨ Hitung mundur trip kalian</p>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {[{v:time.days,l:'Hari'},{v:time.hours,l:'Jam'},{v:time.minutes,l:'Menit'},{v:time.seconds,l:'Detik'}].map((x,i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {i > 0 && <span style={{ fontSize: '1.4em', color: '#1a7aa8', fontWeight: 800, marginBottom: 20 }}>:</span>}
            <Box value={x.v} label={x.l} />
          </div>
        ))}
      </div>
    </div>
  )
}