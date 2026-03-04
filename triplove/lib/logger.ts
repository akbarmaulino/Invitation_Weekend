// lib/logger.ts
// Structured logger untuk semua operasi Supabase & app actions

type LogLevel = 'info' | 'success' | 'error' | 'warn' | 'query'

export interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  action: string
  detail?: string
  data?: unknown
  duration?: number
  error?: string
}

// ── In-memory store (dibaca oleh DebugPanel) ──────────────────
const MAX_LOGS = 100
let logs: LogEntry[] = []
const listeners: Array<(logs: LogEntry[]) => void> = []

function notify() {
  listeners.forEach(fn => fn([...logs]))
}

export function subscribeToLogs(fn: (logs: LogEntry[]) => void) {
  listeners.push(fn)
  fn([...logs])
  return () => {
    const idx = listeners.indexOf(fn)
    if (idx !== -1) listeners.splice(idx, 1)
  }
}

export function clearLogs() {
  logs = []
  notify()
}

// ── Core log function ─────────────────────────────────────────
function addLog(level: LogLevel, action: string, detail?: string, data?: unknown, duration?: number, error?: string) {
  const entry: LogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toLocaleTimeString('id-ID', { hour12: false }),
    level,
    action,
    detail,
    data,
    duration,
    error,
  }

  logs = [entry, ...logs].slice(0, MAX_LOGS)
  notify()

  // ── Pretty console output ─────────────────────────────────
  const icons: Record<LogLevel, string> = {
    info:    '🔵',
    success: '✅',
    error:   '❌',
    warn:    '⚠️',
    query:   '🔍',
  }
  const colors: Record<LogLevel, string> = {
    info:    '#4fc3f7',
    success: '#66bb6a',
    error:   '#ef5350',
    warn:    '#ffa726',
    query:   '#ba68c8',
  }

  const durationStr = duration !== undefined ? ` (${duration}ms)` : ''

  console.groupCollapsed(
    `%c${icons[level]} [${entry.timestamp}] ${action}${durationStr}`,
    `color: ${colors[level]}; font-weight: bold;`
  )
  if (detail)  console.log('%cDetail:', 'color: #aaa', detail)
  if (data)    console.log('%cData:', 'color: #aaa', data)
  if (error)   console.error('%cError:', 'color: #ef5350', error)
  console.groupEnd()

  return entry
}

// ── Public API ────────────────────────────────────────────────
export const logger = {
  info:    (action: string, detail?: string, data?: unknown) => addLog('info',    action, detail, data),
  success: (action: string, detail?: string, data?: unknown, duration?: number) => addLog('success', action, detail, data, duration),
  error:   (action: string, error: string,   data?: unknown) => addLog('error',   action, undefined, data, undefined, error),
  warn:    (action: string, detail?: string, data?: unknown) => addLog('warn',    action, detail, data),
  query:   (action: string, detail?: string, data?: unknown) => addLog('query',   action, detail, data),
}

// ── Supabase wrapper: auto-log semua operasi ──────────────────
export async function dbQuery<T>(
  action: string,
  queryFn: () => PromiseLike<{ data: T | null; error: unknown }>
): Promise<{ data: T | null; error: unknown }> {
  logger.query(action)
  const start = Date.now()

  try {
    const result = await queryFn()
    const duration = Date.now() - start

    if (result.error) {
      const errMsg = (result.error as { message?: string })?.message || String(result.error)
      logger.error(action, errMsg, result.error)
    } else {
      const count = Array.isArray(result.data) ? `${result.data.length} rows` : result.data ? '1 row' : 'no data'
      logger.success(action, count, result.data, duration)
    }

    return result
  } catch (err) {
    const duration = Date.now() - start
    const errMsg = (err as Error)?.message || String(err)
    logger.error(action, errMsg, err)
    return { data: null, error: err }
  }
}