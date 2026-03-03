'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const P = '#03254c', S = '#c4e8ff'

const NAV_ITEMS = [
  { href: '/',           label: 'Home',       icon: '🏠' },
  { href: '/statistics', label: 'Statistics', icon: '📊' },
  { href: '/gallery',    label: 'Gallery',    icon: '📸' },
  { href: '/history',    label: 'History',    icon: '📖' },
  { href: '/settings',   label: 'Settings',   icon: '⚙️' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <>
      {/* ── DESKTOP TOP NAVBAR ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: P,
        boxShadow: '0 4px 24px rgba(3,37,76,0.25)',
        padding: '0 28px',
        display: 'none',
      }} className="nav-desktop">
        <div style={{ maxWidth: 1000, margin: '0 auto', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(196,232,255,0.15)', border: '1.5px solid rgba(196,232,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1em' }}>💕</div>
            <span style={{ fontWeight: 900, fontSize: '1.25em', color: 'white', letterSpacing: -0.5 }}>TripLove</span>
          </Link>
          <nav style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 5, border: '1px solid rgba(196,232,255,0.15)' }}>
            {NAV_ITEMS.map(({ href, label, icon }) => {
              const isActive = pathname === href
              return (
                <Link key={href} href={href} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 16px', borderRadius: 10,
                  textDecoration: 'none', fontWeight: 700, fontSize: '0.87em',
                  transition: 'all 0.2s ease',
                  background: isActive ? 'white' : 'transparent',
                  color: isActive ? P : 'rgba(255,255,255,0.75)',
                  boxShadow: isActive ? '0 2px 8px rgba(3,37,76,0.15)' : 'none',
                }}>
                  <span>{icon}</span>
                  <span>{label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
        <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${S}, transparent)`, opacity: 0.4 }} />
      </header>

      {/* ── MOBILE TOP BAR (logo only) ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: P,
        boxShadow: '0 2px 12px rgba(3,37,76,0.2)',
        padding: '0 20px',
        display: 'none',
      }} className="nav-mobile-top">
        <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.1em' }}>💕</span>
            <span style={{ fontWeight: 900, fontSize: '1.15em', color: 'white', letterSpacing: -0.5 }}>TripLove</span>
          </Link>
        </div>
      </header>

      {/* ── MOBILE BOTTOM NAVBAR ── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        background: P,
        boxShadow: '0 -4px 20px rgba(3,37,76,0.2)',
        padding: '8px 8px calc(8px + env(safe-area-inset-bottom))',
        display: 'none',
      }} className="nav-mobile-bottom">
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const isActive = pathname === href
            return (
              <Link key={href} href={href} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '6px 12px', borderRadius: 12,
                textDecoration: 'none',
                background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                transition: 'all 0.2s',
                minWidth: 56,
              }}>
                <span style={{ fontSize: '1.3em', lineHeight: 1 }}>{icon}</span>
                <span style={{ fontSize: '0.65em', fontWeight: 700, color: isActive ? 'white' : 'rgba(255,255,255,0.5)', letterSpacing: 0.2 }}>{label}</span>
                {isActive && <div style={{ width: 4, height: 4, borderRadius: '50%', background: S, marginTop: -2 }} />}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Responsive CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        .nav-desktop { display: block !important; }
        .nav-mobile-top { display: none !important; }
        .nav-mobile-bottom { display: none !important; }

        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-top { display: block !important; }
          .nav-mobile-bottom { display: flex !important; }
        }
      `}} />
    </>
  )
}