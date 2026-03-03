'use client'

import { useState, useEffect, useRef } from 'react'
import { subscribeToLogs, clearLogs } from '@/lib/logger'
import type { LogEntry } from '@/lib/logger'

const LEVEL_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  success: { bg: '#e8f5e9', color: '#2e7d32', label: 'SUCCESS' },
  error:   { bg: '#ffebee', color: '#c62828', label: 'ERROR'   },
  warn:    { bg: '#fff8e1', color: '#f57f17', label: 'WARN'    },
  query:   { bg: '#f3e5f5', color: '#6a1b9a', label: 'QUERY'   },
  info:    { bg: '#e3f2fd', color: '#1565c0', label: 'INFO'    },
}

export default function DebugPanel() {
  const [logs, setLogs]           = useState<LogEntry[]>([])
  const [open, setOpen]           = useState(false)
  const [filter, setFilter]       = useState<string>('all')
  const [expanded, setExpanded]   = useState<Set<string>>(new Set())
  const [search, setSearch]       = useState('')
  const bottomRef                 = useRef<HTMLDivElement>(null)

  useEffect(() => subscribeToLogs(setLogs), [])

  // Auto-open panel on error
  useEffect(() => {
    if (logs[0]?.level === 'error') setOpen(true)
  }, [logs])

  const filtered = logs.filter(log => {
    if (filter !== 'all' && log.level !== filter) return false
    if (search && !log.action.toLowerCase().includes(search.toLowerCase()) &&
        !log.detail?.toLowerCase().includes(search.toLowerCase()) &&
        !log.error?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const errorCount   = logs.filter(l => l.level === 'error').length
  const successCount = logs.filter(l => l.level === 'success').length

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <>
      {/* ── Toggle Button ── */}
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
          background: errorCount > 0
            ? 'linear-gradient(135deg, #c62828, #ef5350)'
            : 'linear-gradient(135deg, #03254c, #1a4d7a)',
          color: 'white', border: 'none', borderRadius: 28,
          padding: '10px 18px', fontWeight: 700, fontSize: '0.85em',
          cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          display: 'flex', alignItems: 'center', gap: 8,
          transition: 'all 0.2s ease',
        }}
      >
        {open ? '✕ Close' : '🛠️ Debug'}
        {logs.length > 0 && (
          <span style={{
            background: errorCount > 0 ? '#ffcdd2' : '#c4e8ff',
            color: errorCount > 0 ? '#c62828' : '#03254c',
            borderRadius: 20, padding: '1px 8px', fontSize: '0.8em', fontWeight: 800,
          }}>
            {errorCount > 0 ? `${errorCount} ERR` : logs.length}
          </span>
        )}
      </button>

      {/* ── Panel ── */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 70, right: 20, zIndex: 9998,
          width: Math.min(520, window.innerWidth - 40),
          height: 460,
          background: '#0d1117',
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
          border: '1px solid #30363d',
          fontFamily: '"Fira Code", "Cascadia Code", monospace',
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #30363d',
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#161b22',
          }}>
            <span style={{ color: '#58a6ff', fontWeight: 700, fontSize: '0.9em' }}>🛠️ Debug Console</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
              {/* Stats */}
              <span style={{ fontSize: '0.75em', color: '#66bb6a', fontWeight: 600 }}>✅ {successCount}</span>
              <span style={{ fontSize: '0.75em', color: '#ef5350', fontWeight: 600 }}>❌ {errorCount}</span>
              <span style={{ fontSize: '0.75em', color: '#a0a0b5' }}>/{logs.length}</span>
              <button
                onClick={clearLogs}
                style={{ background: '#21262d', border: '1px solid #30363d', color: '#8b949e', borderRadius: 6, padding: '3px 8px', fontSize: '0.75em', cursor: 'pointer' }}
              >🗑️</button>
            </div>
          </div>

          {/* Toolbar */}
          <div style={{
            padding: '8px 12px', borderBottom: '1px solid #30363d',
            display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap',
            background: '#161b22',
          }}>
            {['all', 'success', 'error', 'query', 'warn', 'info'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '2px 10px', borderRadius: 20, fontSize: '0.72em', fontWeight: 700,
                  border: 'none', cursor: 'pointer',
                  background: filter === f
                    ? (f === 'error' ? '#c62828' : f === 'success' ? '#2e7d32' : f === 'query' ? '#6a1b9a' : '#03254c')
                    : '#21262d',
                  color: filter === f ? 'white' : '#8b949e',
                  textTransform: 'uppercase',
                }}
              >{f}</button>
            ))}
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="search..."
              style={{
                marginLeft: 'auto', background: '#21262d', border: '1px solid #30363d',
                borderRadius: 6, padding: '3px 10px', fontSize: '0.75em',
                color: '#e6edf3', outline: 'none', width: 120,
              }}
            />
          </div>

          {/* Log entries */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#8b949e', padding: 30, fontSize: '0.85em' }}>
                No logs yet. Perform any action to see logs here.
              </div>
            ) : (
              filtered.map(log => {
                const style   = LEVEL_STYLE[log.level] || LEVEL_STYLE.info
                const isOpen  = expanded.has(log.id)
                const hasData = log.data !== undefined || log.error

                return (
                  <div
                    key={log.id}
                    onClick={() => hasData && toggleExpand(log.id)}
                    style={{
                      padding: '6px 14px',
                      borderBottom: '1px solid #21262d',
                      cursor: hasData ? 'pointer' : 'default',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#161b22')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* Level badge */}
                      <span style={{
                        fontSize: '0.65em', fontWeight: 800, padding: '1px 6px',
                        borderRadius: 4, background: style.bg, color: style.color,
                        flexShrink: 0, letterSpacing: 0.5,
                      }}>{style.label}</span>

                      {/* Timestamp */}
                      <span style={{ fontSize: '0.72em', color: '#8b949e', flexShrink: 0 }}>{log.timestamp}</span>

                      {/* Action */}
                      <span style={{ fontSize: '0.82em', color: '#e6edf3', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.action}
                      </span>

                      {/* Duration */}
                      {log.duration !== undefined && (
                        <span style={{ fontSize: '0.7em', color: '#58a6ff', marginLeft: 'auto', flexShrink: 0 }}>
                          {log.duration}ms
                        </span>
                      )}

                      {/* Expand indicator */}
                      {hasData && (
                        <span style={{ fontSize: '0.7em', color: '#8b949e', flexShrink: 0 }}>
                          {isOpen ? '▲' : '▼'}
                        </span>
                      )}
                    </div>

                    {/* Detail line */}
                    {log.detail && (
                      <div style={{ fontSize: '0.75em', color: '#8b949e', marginTop: 2, paddingLeft: 2 }}>
                        {log.detail}
                      </div>
                    )}

                    {/* Error message */}
                    {log.error && (
                      <div style={{ fontSize: '0.75em', color: '#ef5350', marginTop: 2, paddingLeft: 2 }}>
                        ⚠ {log.error}
                      </div>
                    )}

                    {/* Expanded data */}
                    {isOpen && log.data !== undefined && (
                      <pre style={{
                        marginTop: 8, padding: '10px 12px',
                        background: '#0d1117', borderRadius: 8,
                        fontSize: '0.72em', color: '#79c0ff',
                        overflowX: 'auto', border: '1px solid #30363d',
                        maxHeight: 180, overflowY: 'auto',
                        lineHeight: 1.5,
                      }}>
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      )}
    </>
  )
}