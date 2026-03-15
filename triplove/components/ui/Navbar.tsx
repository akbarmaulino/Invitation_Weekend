'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const P = '#03254c', S = '#c4e8ff'

const MAIN_ITEMS = [
  { href: '/',            label: 'Home',        icon: '🏠' },
  { href: '/statistics',  label: 'Statistics',  icon: '📊' },
  { href: '/watch-party', label: 'Watch Party', icon: '🍿' },
  { href: '/gallery',     label: 'Gallery',     icon: '📸' },
  { href: '/history',     label: 'History',     icon: '📖' },
  { href: '/games',       label: 'Games',       icon: '🎮' },
  // { href: '/locations',   label: 'Locations',   icon: '🗺️' },
]

const SETTINGS = { href: '/settings', label: 'Settings', icon: '⚙️' }
const ALL_ITEMS = [...MAIN_ITEMS, SETTINGS]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <>
      {/* ── DESKTOP ── */}
      <header className="nav-desktop" style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: P,
        borderBottom: `1px solid rgba(196,232,255,0.12)`,
        boxShadow: '0 2px 20px rgba(3,37,76,0.2)',
        display: 'none',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          height: 60, padding: '0 24px',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginRight: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'rgba(196,232,255,0.18)',
              border: '1.5px solid rgba(196,232,255,0.28)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9em',
            }}>💕</div>
            <span style={{ fontWeight: 900, fontSize: '1.1em', color: 'white', letterSpacing: '-0.3px' }}>
              TripLove
            </span>
          </Link>

          {/* Divider */}
          <div style={{ width: 1, height: 28, background: 'rgba(196,232,255,0.15)', flexShrink: 0 }} />

          {/* Nav links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            {MAIN_ITEMS.map(({ href, label, icon }) => {
              const active = pathname === href
              return (
                <Link key={href} href={href} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 11px', borderRadius: 8,
                  textDecoration: 'none',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.83em',
                  letterSpacing: '0.01em',
                  whiteSpace: 'nowrap',
                  color: active ? P : 'rgba(255,255,255,0.7)',
                  background: active ? S : 'transparent',
                  transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: '0.95em' }}>{icon}</span>
                  <span>{label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Settings — far right, icon only */}
          <Link href={SETTINGS.href} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 11px', borderRadius: 8,
            textDecoration: 'none', flexShrink: 0,
            fontWeight: pathname === SETTINGS.href ? 700 : 500,
            fontSize: '0.83em',
            color: pathname === SETTINGS.href ? P : 'rgba(255,255,255,0.7)',
            background: pathname === SETTINGS.href ? S : 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(196,232,255,0.12)',
            transition: 'all 0.15s',
          }}>
            <span>{SETTINGS.icon}</span>
            <span>{SETTINGS.label}</span>
          </Link>
        </div>
      </header>

      {/* ── MOBILE TOP BAR ── */}
      <header className="nav-mobile-top" style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: P,
        boxShadow: '0 2px 12px rgba(3,37,76,0.2)',
        display: 'none',
      }}>
        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
            <span>💕</span>
            <span style={{ fontWeight: 900, fontSize: '1.08em', color: 'white', letterSpacing: '-0.3px' }}>TripLove</span>
          </Link>
        </div>
      </header>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="nav-mobile-bottom" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        background: P,
        boxShadow: '0 -2px 16px rgba(3,37,76,0.18)',
        padding: '6px 0 calc(6px + env(safe-area-inset-bottom))',
        display: 'none',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {ALL_ITEMS.map(({ href, label, icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '4px 6px', borderRadius: 8,
                textDecoration: 'none', flex: 1, minWidth: 0,
                position: 'relative',
              }}>
                {active && (
                  <div style={{
                    position: 'absolute', top: 0, left: '50%',
                    transform: 'translateX(-50%)',
                    width: 24, height: 2, borderRadius: 1,
                    background: S,
                  }} />
                )}
                <span style={{
                  fontSize: '1.15em', lineHeight: 1,
                  opacity: active ? 1 : 0.5,
                  transition: 'opacity 0.15s',
                }}>{icon}</span>
                <span className="nav-label" style={{
                  fontSize: '0.51em', fontWeight: active ? 700 : 500,
                  color: active ? 'white' : 'rgba(255,255,255,0.45)',
                  whiteSpace: 'nowrap', overflow: 'hidden',
                  textOverflow: 'ellipsis', maxWidth: '100%', textAlign: 'center',
                }}>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <style dangerouslySetInnerHTML={{ __html: `
        .nav-desktop { display: block !important; }
        .nav-mobile-top, .nav-mobile-bottom { display: none !important; }

        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-top { display: block !important; }
          .nav-mobile-bottom { display: flex !important; }
        }
        @media (max-width: 360px) {
          .nav-label { display: none !important; }
        }
      `}} />
    </>
  )
}