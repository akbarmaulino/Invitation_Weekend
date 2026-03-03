'use client'
import { useEffect } from 'react'

const cfg = {
  success: { bg: '#ecfdf5', border: '#6ee7b7', color: '#065f46', icon: '✅' },
  error:   { bg: '#fff1f2', border: '#fda4af', color: '#9f1239', icon: '❌' },
  warn:    { bg: '#fffbeb', border: '#fcd34d', color: '#92400e', icon: '⚠️' },
  info:    { bg: '#f0f9ff', border: '#7dd3fc', color: '#0c4a6e', icon: '💬' },
}

export default function Toast({ message, type = 'info', onClose, duration = 3500 }: {
  message: string; type?: keyof typeof cfg; onClose: () => void; duration?: number
}) {
  useEffect(() => { const t = setTimeout(onClose, duration); return () => clearTimeout(t) }, [])
  const s = cfg[type]
  return (
    <div onClick={onClose} style={{
      position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, cursor: 'pointer',
      background: s.bg, border: `2px solid ${s.border}`, color: s.color,
      borderRadius: 999, padding: '10px 20px',
      fontWeight: 700, fontSize: '0.88em',
      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
      display: 'flex', alignItems: 'center', gap: 8,
      maxWidth: '90vw', whiteSpace: 'nowrap',
    }}>
      <span>{s.icon}</span><span>{message}</span>
    </div>
  )
}